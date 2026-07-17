import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * Chỉ cho sửa nội dung chi phí. Kỳ (period_type/year/month) là cố định —
 * muốn chuyển kỳ thì xóa và nhập lại ở kỳ đúng.
 */
export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
