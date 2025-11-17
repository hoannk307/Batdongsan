import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, PropertyPurpose } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Nhà đẹp tại quận 1' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Mô tả chi tiết về căn nhà...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.HOUSE })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: PropertyPurpose, example: PropertyPurpose.SALE })
  @IsEnum(PropertyPurpose)
  purpose: PropertyPurpose;

  @ApiProperty({ example: 5000000000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  floors?: number;

  @ApiProperty({ example: 'south', required: false })
  @IsOptional()
  @IsString()
  houseDirection?: string;

  @ApiProperty({ example: 'southeast', required: false })
  @IsOptional()
  @IsString()
  balconyDirection?: string;

  @ApiProperty({ example: 'Hồ Chí Minh' })
  @IsString()
  province: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Phường Bến Nghé', required: false })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ example: '123 Nguyễn Huệ', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: 10.762622, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 106.660172, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  contactPhone: string;

  @ApiProperty({ example: 'contact@example.com', required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

