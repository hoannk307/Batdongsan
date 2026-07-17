import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

/**
 * Thống kê doanh thu booking.
 *
 * Quy ước (đã chốt với nghiệp vụ):
 * - Thu nhập của 1 booking = bk_bookings.total_amount (đã gồm phụ phí).
 * - Booking được tính trọn vào tháng của check_out (tháng khách trả phòng),
 *   kể cả khi ở vắt qua 2 tháng. Nhờ vậy tổng thu 12 tháng luôn khớp tổng thu cả năm.
 * - Chi phí tháng và chi phí năm là 2 khoản tách biệt:
 *     Doanh thu tháng = tổng thu booking trong tháng − chi phí phát sinh của tháng.
 *     Doanh thu năm   = tổng thu 12 tháng − tổng chi phí 12 tháng − chi phí riêng của năm.
 */
@Injectable()
export class RevenueService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mốc thời gian tính theo UTC vì check_out là cột `date`
   * (Prisma lưu ở nửa đêm UTC). Dùng giờ địa phương sẽ lệch mốc tháng ở VN (UTC+7).
   */
  private monthRangeUtc(year: number, month: number) {
    return {
      start: new Date(Date.UTC(year, month - 1, 1)),
      end: new Date(Date.UTC(year, month, 1)), // exclusive
    };
  }

  private round2(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  private toNumber(d: any): number {
    return d == null ? 0 : Number(d);
  }

  private nights(checkIn: Date, checkOut: Date) {
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  private serializeExpense(e: any) {
    return {
      id: e.id,
      period_type: e.period_type,
      year: e.year,
      month: e.month,
      name: e.name,
      amount: this.toNumber(e.amount),
      comment: e.comment,
      created_at: e.created_at,
    };
  }

  // ===== Thống kê =====

  /**
   * Doanh thu 1 tháng: danh sách booking (thu nhập từng booking) + chi phí phát sinh của tháng.
   */
  async getMonthlyRevenue(userId: number, month: number, year: number) {
    if (!month || month < 1 || month > 12) throw new BadRequestException('month không hợp lệ (1-12)');
    if (!year || year < 2000 || year > 2100) throw new BadRequestException('year không hợp lệ');

    const { start, end } = this.monthRangeUtc(year, month);

    const [bookings, expenses] = await Promise.all([
      this.prisma.bk_bookings.findMany({
        where: { user_id: userId, check_out: { gte: start, lt: end } },
        include: { rooms: true, sources: true },
        orderBy: { check_out: 'asc' },
      }),
      this.prisma.bk_expenses.findMany({
        where: { user_id: userId, period_type: 'MONTH', year, month },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    const bookingRows = bookings.map((b) => ({
      id: b.id,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      room_name: b.rooms?.name || null,
      source_name: b.sources?.name || null,
      check_in: b.check_in,
      check_out: b.check_out,
      nights: this.nights(b.check_in, b.check_out),
      status: b.status,
      income: this.toNumber(b.total_amount),
    }));

    const expenseRows = expenses.map((e) => this.serializeExpense(e));

    const total_income = this.round2(bookingRows.reduce((s, b) => s + b.income, 0));
    const total_expense = this.round2(expenseRows.reduce((s, e) => s + e.amount, 0));

    return {
      month,
      year,
      bookings: bookingRows,
      expenses: expenseRows,
      totals: {
        booking_count: bookingRows.length,
        total_income,
        total_expense,
        revenue: this.round2(total_income - total_expense),
      },
    };
  }

  /**
   * Doanh thu 1 năm: bảng 12 tháng + chi phí phát sinh riêng của năm.
   */
  async getYearlyRevenue(userId: number, year: number) {
    if (!year || year < 2000 || year > 2100) throw new BadRequestException('year không hợp lệ');

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const [bookings, expenses] = await Promise.all([
      this.prisma.bk_bookings.findMany({
        where: { user_id: userId, check_out: { gte: start, lt: end } },
        select: { check_out: true, total_amount: true },
      }),
      this.prisma.bk_expenses.findMany({
        where: { user_id: userId, year },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    // Gom thu nhập theo tháng của check_out.
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      booking_count: 0,
      total_income: 0,
      total_expense: 0,
      revenue: 0,
    }));

    for (const b of bookings) {
      const idx = new Date(b.check_out).getUTCMonth();
      months[idx].booking_count += 1;
      months[idx].total_income += this.toNumber(b.total_amount);
    }

    for (const e of expenses) {
      if (e.period_type === 'MONTH' && e.month) {
        months[e.month - 1].total_expense += this.toNumber(e.amount);
      }
    }

    for (const m of months) {
      m.total_income = this.round2(m.total_income);
      m.total_expense = this.round2(m.total_expense);
      m.revenue = this.round2(m.total_income - m.total_expense);
    }

    const yearExpenses = expenses
      .filter((e) => e.period_type === 'YEAR')
      .map((e) => this.serializeExpense(e));

    const total_income = this.round2(months.reduce((s, m) => s + m.total_income, 0));
    const total_month_expense = this.round2(months.reduce((s, m) => s + m.total_expense, 0));
    const total_year_expense = this.round2(yearExpenses.reduce((s, e) => s + e.amount, 0));

    return {
      year,
      months,
      expenses: yearExpenses,
      totals: {
        booking_count: months.reduce((s, m) => s + m.booking_count, 0),
        total_income,
        total_month_expense,
        total_year_expense,
        total_expense: this.round2(total_month_expense + total_year_expense),
        revenue: this.round2(total_income - total_month_expense - total_year_expense),
      },
    };
  }

  // ===== Chi phí phát sinh =====

  async findExpenses(userId: number, year: number, periodType?: string, month?: number) {
    const where: any = { user_id: userId, year };
    if (periodType) where.period_type = periodType;
    if (month) where.month = month;

    const rows = await this.prisma.bk_expenses.findMany({
      where,
      orderBy: { created_at: 'asc' },
    });
    return rows.map((e) => this.serializeExpense(e));
  }

  async createExpense(userId: number, dto: CreateExpenseDto) {
    if (dto.period_type === 'MONTH' && !dto.month) {
      throw new BadRequestException('Chi phí theo tháng phải có month');
    }
    if (!dto.name?.trim()) {
      throw new BadRequestException('Tên chi phí không được để trống');
    }

    const created = await this.prisma.bk_expenses.create({
      data: {
        user_id: userId,
        period_type: dto.period_type as any,
        year: dto.year,
        // Chi phí năm không gắn với tháng nào.
        month: dto.period_type === 'MONTH' ? dto.month : null,
        name: dto.name.trim(),
        amount: dto.amount,
        comment: dto.comment?.trim() || null,
      },
    });
    return this.serializeExpense(created);
  }

  async updateExpense(userId: number, id: number, dto: UpdateExpenseDto) {
    await this.findExpenseOwned(id, userId);

    const data: any = {};
    if (dto.name !== undefined) {
      if (!dto.name.trim()) throw new BadRequestException('Tên chi phí không được để trống');
      data.name = dto.name.trim();
    }
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.comment !== undefined) data.comment = dto.comment?.trim() || null;

    const updated = await this.prisma.bk_expenses.update({ where: { id }, data });
    return this.serializeExpense(updated);
  }

  async removeExpense(userId: number, id: number) {
    await this.findExpenseOwned(id, userId);
    await this.prisma.bk_expenses.delete({ where: { id } });
    return { message: 'Đã xóa chi phí' };
  }

  private async findExpenseOwned(id: number, userId: number) {
    const expense = await this.prisma.bk_expenses.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.user_id !== userId) throw new ForbiddenException('Not your expense');
    return expense;
  }
}
