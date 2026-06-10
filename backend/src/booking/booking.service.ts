import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { LockDaysDto } from './dto/lock-days.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo booking mới (kèm surcharges + payments) trong transaction.
   */
  async create(userId: number, dto: CreateBookingDto) {
    // Validate room belongs to user
    const room = await this.prisma.bk_rooms.findUnique({ where: { id: dto.room_id } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.user_id !== userId) throw new ForbiddenException('Not your room');

    const checkIn = new Date(dto.check_in);
    const checkOut = new Date(dto.check_out);

    if (checkIn >= checkOut) {
      throw new BadRequestException('check_in must be before check_out');
    }

    // Check overlap with existing bookings
    const overlapping = await this.prisma.bk_bookings.findFirst({
      where: {
        room_id: dto.room_id,
        status: 'CONFIRMED',
        check_in: { lt: checkOut },
        check_out: { gt: checkIn },
      },
    });
    if (overlapping) {
      throw new BadRequestException('Ngày đã có booking khác trùng lịch');
    }

    // Check locked days
    const lockedDays = await this.prisma.bk_locked_days.findMany({
      where: {
        room_id: dto.room_id,
        locked_date: { gte: checkIn, lt: checkOut },
      },
    });
    if (lockedDays.length > 0) {
      throw new BadRequestException('Một số ngày trong khoảng đã bị khóa');
    }

    // Transaction: create booking + surcharges + payments
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bk_bookings.create({
        data: {
          room_id: dto.room_id,
          source_id: dto.source_id || null,
          user_id: userId,
          customer_name: dto.customer_name,
          customer_phone: dto.customer_phone || null,
          check_in: checkIn,
          check_out: checkOut,
          price_per_night: dto.price_per_night,
          estimated_revenue: dto.estimated_revenue,
          total_amount: dto.total_amount,
          comment: dto.comment || null,
        },
      });

      if (dto.surcharges && dto.surcharges.length > 0) {
        await tx.bk_surcharges.createMany({
          data: dto.surcharges.map((s) => ({
            booking_id: booking.id,
            name: s.name,
            price: s.price,
            comment: s.comment || null,
          })),
        });
      }

      if (dto.payments && dto.payments.length > 0) {
        await tx.bk_payments.createMany({
          data: dto.payments.map((p) => ({
            booking_id: booking.id,
            payment_date: new Date(p.payment_date),
            amount: p.amount,
            comment: p.comment || null,
          })),
        });
      }

      return tx.bk_bookings.findUnique({
        where: { id: booking.id },
        include: {
          surcharges: true,
          payments: { orderBy: { payment_date: 'asc' } },
          sources: true,
          rooms: true,
        },
      });
    });
  }

  /**
   * Lấy danh sách bookings theo room và/hoặc tháng.
   */
  async findAll(userId: number, roomId?: number, month?: number, year?: number) {
    const where: any = { user_id: userId };

    if (roomId) where.room_id = roomId;

    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      where.OR = [
        { check_in: { gte: startOfMonth, lte: endOfMonth } },
        { check_out: { gte: startOfMonth, lte: endOfMonth } },
        { check_in: { lte: startOfMonth }, check_out: { gte: endOfMonth } },
      ];
    }

    return this.prisma.bk_bookings.findMany({
      where,
      orderBy: { check_in: 'asc' },
      include: {
        surcharges: true,
        payments: { orderBy: { payment_date: 'asc' } },
        sources: true,
        rooms: true,
      },
    });
  }

  /**
   * Dữ liệu calendar: bookings + locked days cho 1 phòng, 1 tháng.
   */
  async getCalendarData(userId: number, roomId: number, month: number, year: number) {
    // Verify room belongs to user
    const room = await this.prisma.bk_rooms.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.user_id !== userId) throw new ForbiddenException('Not your room');

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [bookings, lockedDays] = await Promise.all([
      this.prisma.bk_bookings.findMany({
        where: {
          room_id: roomId,
          status: 'CONFIRMED',
          check_in: { lte: endOfMonth },
          check_out: { gte: startOfMonth },
        },
        include: {
          sources: true,
          surcharges: true,
          payments: { orderBy: { payment_date: 'asc' } },
        },
        orderBy: { check_in: 'asc' },
      }),
      this.prisma.bk_locked_days.findMany({
        where: {
          room_id: roomId,
          locked_date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    return { room, bookings, lockedDays };
  }

  /**
   * Dữ liệu timeline dashboard: tất cả phòng của user, 1 tháng.
   */
  async getTimelineData(userId: number, month: number, year: number) {
    const rooms = await this.prisma.bk_rooms.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });

    const roomIds = rooms.map((r) => r.id);
    if (roomIds.length === 0) return { rooms: [], bookings: [], lockedDays: [] };

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [bookings, lockedDays] = await Promise.all([
      this.prisma.bk_bookings.findMany({
        where: {
          room_id: { in: roomIds },
          status: 'CONFIRMED',
          check_in: { lte: endOfMonth },
          check_out: { gte: startOfMonth },
        },
        include: {
          sources: true,
          rooms: true,
        },
        orderBy: { check_in: 'asc' },
      }),
      this.prisma.bk_locked_days.findMany({
        where: {
          room_id: { in: roomIds },
          locked_date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    return { rooms, bookings, lockedDays };
  }

  async findOne(id: number, userId: number) {
    const booking = await this.prisma.bk_bookings.findUnique({
      where: { id },
      include: {
        surcharges: true,
        payments: { orderBy: { payment_date: 'asc' } },
        sources: true,
        rooms: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user_id !== userId) throw new ForbiddenException('Not your booking');
    return booking;
  }

  async update(id: number, userId: number, dto: UpdateBookingDto) {
    const existing = await this.findOne(id, userId);

    const checkIn = dto.check_in ? new Date(dto.check_in) : undefined;
    const checkOut = dto.check_out ? new Date(dto.check_out) : undefined;

    if (checkIn && checkOut && checkIn >= checkOut) {
      throw new BadRequestException('check_in must be before check_out');
    }

    // Check overlap if dates changed
    if (checkIn || checkOut) {
      const newCheckIn = checkIn || new Date(existing.check_in);
      const newCheckOut = checkOut || new Date(existing.check_out);

      const overlapping = await this.prisma.bk_bookings.findFirst({
        where: {
          room_id: existing.room_id,
          id: { not: id },
          status: 'CONFIRMED',
          check_in: { lt: newCheckOut },
          check_out: { gt: newCheckIn },
        },
      });
      if (overlapping) {
        throw new BadRequestException('Ngày đã có booking khác trùng lịch');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const data: any = {};
      if (dto.source_id !== undefined) data.source_id = dto.source_id;
      if (dto.customer_name !== undefined) data.customer_name = dto.customer_name;
      if (dto.customer_phone !== undefined) data.customer_phone = dto.customer_phone;
      if (checkIn) data.check_in = checkIn;
      if (checkOut) data.check_out = checkOut;
      if (dto.price_per_night !== undefined) data.price_per_night = dto.price_per_night;
      if (dto.estimated_revenue !== undefined) data.estimated_revenue = dto.estimated_revenue;
      if (dto.total_amount !== undefined) data.total_amount = dto.total_amount;
      if (dto.comment !== undefined) data.comment = dto.comment;
      if (dto.status !== undefined) data.status = dto.status;

      await tx.bk_bookings.update({ where: { id }, data });

      // Replace surcharges if provided
      if (dto.surcharges !== undefined) {
        await tx.bk_surcharges.deleteMany({ where: { booking_id: id } });
        if (dto.surcharges.length > 0) {
          await tx.bk_surcharges.createMany({
            data: dto.surcharges.map((s) => ({
              booking_id: id,
              name: s.name,
              price: s.price,
              comment: s.comment || null,
            })),
          });
        }
      }

      // Replace payments if provided
      if (dto.payments !== undefined) {
        await tx.bk_payments.deleteMany({ where: { booking_id: id } });
        if (dto.payments.length > 0) {
          await tx.bk_payments.createMany({
            data: dto.payments.map((p) => ({
              booking_id: id,
              payment_date: new Date(p.payment_date),
              amount: p.amount,
              comment: p.comment || null,
            })),
          });
        }
      }

      return tx.bk_bookings.findUnique({
        where: { id },
        include: {
          surcharges: true,
          payments: { orderBy: { payment_date: 'asc' } },
          sources: true,
          rooms: true,
        },
      });
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.bk_bookings.delete({ where: { id } });
  }

  // ===== Lock Days =====

  async lockDays(userId: number, dto: LockDaysDto) {
    const room = await this.prisma.bk_rooms.findUnique({ where: { id: dto.room_id } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.user_id !== userId) throw new ForbiddenException('Not your room');

    const records = dto.dates.map((d) => ({
      room_id: dto.room_id,
      locked_date: new Date(d),
    }));

    // Use skipDuplicates to avoid errors if some days already locked
    await this.prisma.bk_locked_days.createMany({
      data: records,
      skipDuplicates: true,
    });

    return { message: `Đã khóa ${dto.dates.length} ngày` };
  }

  async unlockDays(userId: number, dto: LockDaysDto) {
    const room = await this.prisma.bk_rooms.findUnique({ where: { id: dto.room_id } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.user_id !== userId) throw new ForbiddenException('Not your room');

    const dates = dto.dates.map((d) => new Date(d));

    await this.prisma.bk_locked_days.deleteMany({
      where: {
        room_id: dto.room_id,
        locked_date: { in: dates },
      },
    });

    return { message: `Đã mở khóa ${dto.dates.length} ngày` };
  }

  // ===== Payments (add/remove individually) =====

  async addPayment(userId: number, bookingId: number, data: { payment_date: string; amount: number; comment?: string }) {
    const booking = await this.findOne(bookingId, userId);
    return this.prisma.bk_payments.create({
      data: {
        booking_id: bookingId,
        payment_date: new Date(data.payment_date),
        amount: data.amount,
        comment: data.comment || null,
      },
    });
  }

  async removePayment(userId: number, paymentId: number) {
    const payment = await this.prisma.bk_payments.findUnique({
      where: { id: paymentId },
      include: { bookings: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.bookings.user_id !== userId) throw new ForbiddenException('Not your booking');
    return this.prisma.bk_payments.delete({ where: { id: paymentId } });
  }

  // ===== Surcharges (add/remove individually) =====

  async addSurcharge(userId: number, bookingId: number, data: { name: string; price: number; comment?: string }) {
    const booking = await this.findOne(bookingId, userId);
    return this.prisma.bk_surcharges.create({
      data: {
        booking_id: bookingId,
        name: data.name,
        price: data.price,
        comment: data.comment || null,
      },
    });
  }

  async removeSurcharge(userId: number, surchargeId: number) {
    const surcharge = await this.prisma.bk_surcharges.findUnique({
      where: { id: surchargeId },
      include: { bookings: true },
    });
    if (!surcharge) throw new NotFoundException('Surcharge not found');
    if (surcharge.bookings.user_id !== userId) throw new ForbiddenException('Not your booking');
    return this.prisma.bk_surcharges.delete({ where: { id: surchargeId } });
  }
}
