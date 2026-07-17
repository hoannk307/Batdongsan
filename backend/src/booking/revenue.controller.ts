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
import { RevenueService } from './revenue.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('booking')
@Controller('booking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  // ===== Thống kê doanh thu =====

  @Get('revenue/monthly')
  @ApiOperation({ summary: 'Doanh thu theo tháng (danh sách booking + chi phí tháng)' })
  getMonthly(@Request() req, @Query('month') month: string, @Query('year') year: string) {
    return this.revenueService.getMonthlyRevenue(req.user.userId, +month, +year);
  }

  @Get('revenue/yearly')
  @ApiOperation({ summary: 'Doanh thu theo năm (bảng 12 tháng + chi phí năm)' })
  getYearly(@Request() req, @Query('year') year: string) {
    return this.revenueService.getYearlyRevenue(req.user.userId, +year);
  }

  // ===== Chi phí phát sinh =====

  @Get('expenses')
  @ApiOperation({ summary: 'Danh sách chi phí phát sinh theo kỳ' })
  findExpenses(
    @Request() req,
    @Query('year') year: string,
    @Query('period_type') periodType?: string,
    @Query('month') month?: string,
  ) {
    return this.revenueService.findExpenses(
      req.user.userId,
      +year,
      periodType,
      month ? +month : undefined,
    );
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Thêm chi phí phát sinh (theo tháng hoặc theo năm)' })
  createExpense(@Request() req, @Body() dto: CreateExpenseDto) {
    return this.revenueService.createExpense(req.user.userId, dto);
  }

  @Put('expenses/:id')
  @ApiOperation({ summary: 'Cập nhật chi phí phát sinh' })
  updateExpense(@Request() req, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.revenueService.updateExpense(req.user.userId, +id, dto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Xóa chi phí phát sinh' })
  removeExpense(@Request() req, @Param('id') id: string) {
    return this.revenueService.removeExpense(req.user.userId, +id);
  }
}
