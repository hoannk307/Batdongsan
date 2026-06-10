import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SurchargeItemDto, PaymentItemDto } from './create-booking.dto';

export class UpdateBookingDto {
  @IsOptional()
  @IsNumber()
  source_id?: number;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsDateString()
  check_in?: string;

  @IsOptional()
  @IsDateString()
  check_out?: string;

  @IsOptional()
  @IsNumber()
  price_per_night?: number;

  @IsOptional()
  @IsNumber()
  estimated_revenue?: number;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(['CONFIRMED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurchargeItemDto)
  surcharges?: SurchargeItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments?: PaymentItemDto[];
}
