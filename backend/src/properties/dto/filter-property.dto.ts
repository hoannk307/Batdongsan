import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { PropertyStatus } from '@prisma/client';
import {
  PropertySortDefault,
  PropertyTypeDefault,
} from '../enums/property-defaults.enum';

/**
 * DTO cho endpoint GET /properties/filter
 *
 * Tối ưu để truyền qua query string (flat params, không dùng array).
 * Ví dụ: GET /properties/filter?property_type=Nhà đất&property_status=FOR_SALE&min_beds=2&min_price=500000000
 */
export class FilterPropertyDto {
  // ── Phân trang ───────────────────────────────────────────────────────────
  @ApiProperty({ example: 1, description: 'Số trang', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Số lượng mỗi trang (max 100)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // ── Loại & trạng thái ────────────────────────────────────────────────────
  @ApiProperty({
    enum: PropertyTypeDefault,
    example: PropertyTypeDefault.NHADAT,
    description: 'Loại bất động sản',
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyTypeDefault)
  property_type?: PropertyTypeDefault;

  @ApiProperty({
    enum: PropertyStatus,
    example: PropertyStatus.FOR_SALE,
    description: 'Trạng thái giao dịch (FOR_SALE | FOR_RENT)',
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  property_status?: PropertyStatus;

  // ── Phòng ngủ / phòng tắm ────────────────────────────────────────────────
  @ApiProperty({ example: 2, description: 'Số phòng ngủ tối thiểu', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beds?: number;

  @ApiProperty({ example: 1, description: 'Số phòng tắm tối thiểu', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baths?: number;

  // ── Diện tích (m²) ────────────────────────────────────────────────────────
  @ApiProperty({ example: 50, description: 'Diện tích tối thiểu (m²)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area_min?: number;

  @ApiProperty({ example: 300, description: 'Diện tích tối đa (m²)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area_max?: number;

  // ── Giá ──────────────────────────────────────────────────────────────────
  @ApiProperty({ example: 500000000, description: 'Giá tối thiểu (VNĐ)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_min?: number;

  @ApiProperty({ example: 10000000000, description: 'Giá tối đa (VNĐ)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_max?: number;

  // ── Vị trí ───────────────────────────────────────────────────────────────
  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Tỉnh / Thành phố', required: false })
  @IsOptional()
  @IsString()
  any_city?: string;

  @ApiProperty({ example: 'Phường Bến Nghé', description: 'Phường / Xã', required: false })
  @IsOptional()
  @IsString()
  any_ward?: string;

  @ApiProperty({ example: 'Nhà hát Thành Phố', description: 'Địa điểm / Địa chỉ gần nhất', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  // ── Sắp xếp ──────────────────────────────────────────────────────────────
  @ApiProperty({
    enum: PropertySortDefault,
    example: PropertySortDefault.NEWEST,
    description: 'Thứ tự sắp xếp',
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertySortDefault)
  sort?: PropertySortDefault = PropertySortDefault.NEWEST;
}
