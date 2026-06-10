import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { LockDaysDto } from './dto/lock-days.dto';

@ApiTags('booking')
@Controller('booking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ===== Bookings =====

  @Get('bookings')
  @ApiOperation({ summary: 'Danh sách bookings' })
  findAll(
    @Request() req,
    @Query('room_id') roomId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.bookingService.findAll(
      req.user.userId,
      roomId ? +roomId : undefined,
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }

  @Get('bookings/calendar')
  @ApiOperation({ summary: 'Dữ liệu calendar cho 1 phòng, 1 tháng' })
  getCalendar(
    @Request() req,
    @Query('room_id') roomId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.bookingService.getCalendarData(req.user.userId, +roomId, +month, +year);
  }

  @Get('bookings/timeline')
  @ApiOperation({ summary: 'Dữ liệu timeline dashboard' })
  getTimeline(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.bookingService.getTimelineData(req.user.userId, +month, +year);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Chi tiết booking' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookingService.findOne(+id, req.user.userId);
  }

  @Post('bookings')
  @ApiOperation({ summary: 'Tạo booking mới' })
  create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(req.user.userId, dto);
  }

  @Put('bookings/:id')
  @ApiOperation({ summary: 'Cập nhật booking' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.update(+id, req.user.userId, dto);
  }

  @Delete('bookings/:id')
  @ApiOperation({ summary: 'Xóa booking' })
  remove(@Request() req, @Param('id') id: string) {
    return this.bookingService.remove(+id, req.user.userId);
  }

  // ===== Lock Days =====

  @Post('lock-days')
  @ApiOperation({ summary: 'Khóa ngày cho phòng' })
  lockDays(@Request() req, @Body() dto: LockDaysDto) {
    return this.bookingService.lockDays(req.user.userId, dto);
  }

  @Delete('lock-days')
  @ApiOperation({ summary: 'Mở khóa ngày' })
  unlockDays(@Request() req, @Body() dto: LockDaysDto) {
    return this.bookingService.unlockDays(req.user.userId, dto);
  }

  // ===== Payments =====

  @Post('payments')
  @ApiOperation({ summary: 'Thêm đợt thanh toán' })
  addPayment(
    @Request() req,
    @Body() body: { booking_id: number; payment_date: string; amount: number; comment?: string },
  ) {
    return this.bookingService.addPayment(req.user.userId, body.booking_id, body);
  }

  @Delete('payments/:id')
  @ApiOperation({ summary: 'Xóa đợt thanh toán' })
  removePayment(@Request() req, @Param('id') id: string) {
    return this.bookingService.removePayment(req.user.userId, +id);
  }

  // ===== Surcharges =====

  @Post('surcharges')
  @ApiOperation({ summary: 'Thêm phụ phí' })
  addSurcharge(
    @Request() req,
    @Body() body: { booking_id: number; name: string; price: number; comment?: string },
  ) {
    return this.bookingService.addSurcharge(req.user.userId, body.booking_id, body);
  }

  @Delete('surcharges/:id')
  @ApiOperation({ summary: 'Xóa phụ phí' })
  removeSurcharge(@Request() req, @Param('id') id: string) {
    return this.bookingService.removeSurcharge(req.user.userId, +id);
  }
}
