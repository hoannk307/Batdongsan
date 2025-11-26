import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PropertyStatus } from '@prisma/client';
import {
  PropertySortDefault,
  PropertyTypeDefault,
} from '../enums/property-defaults.enum';

export class SearchPropertyDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    enum: PropertyStatus,
    example: PropertyStatus.FOR_RENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  propertyStatus?: PropertyStatus;

  @ApiProperty({
    enum: PropertyTypeDefault,
    isArray: true,
    example: [PropertyTypeDefault.NHADAT, PropertyTypeDefault.NHADAT],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PropertyTypeDefault, { each: true })
  propertyTypes?: PropertyTypeDefault[];

  @ApiProperty({ example: ['Hồ Chí Minh', 'Hà Nội'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @ApiProperty({ example: ['Phường 1', 'Phường 2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wards?: string[];

  @ApiProperty({ example: 1000000000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ example: 5000000000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minArea?: number;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxArea?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBeds?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBaths?: number;

  @ApiProperty({
    enum: PropertySortDefault,
    example: PropertySortDefault.NEWEST,
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertySortDefault)
  sort?: PropertySortDefault;
}

