import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max } from 'class-validator';

export class CreateExpenseDto {
  /** Bỏ trống = chi phí chung, không thuộc phòng nào. */
  @IsOptional()
  @IsInt()
  room_id?: number;

  @IsEnum(['MONTH', 'YEAR'])
  period_type: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  /** Bắt buộc khi period_type = MONTH, bỏ qua khi period_type = YEAR. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
