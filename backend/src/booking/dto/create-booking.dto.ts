import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SurchargeItemDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class PaymentItemDto {
  @IsDateString()
  payment_date: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateBookingDto {
  @IsNumber()
  room_id: number;

  @IsOptional()
  @IsNumber()
  source_id?: number;

  @IsString()
  customer_name: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsDateString()
  check_in: string;

  @IsDateString()
  check_out: string;

  @IsNumber()
  price_per_night: number;

  @IsNumber()
  estimated_revenue: number;

  @IsNumber()
  total_amount: number;

  @IsOptional()
  @IsString()
  comment?: string;

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
