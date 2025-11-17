import { IsOptional, IsString, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiProperty({ example: 'sale', enum: ['all', 'sale', 'rent'], required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ example: ['HOUSE', 'APARTMENT'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiProperty({ example: ['Hồ Chí Minh', 'Hà Nội'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  provinces?: string[];

  @ApiProperty({ example: ['Quận 1', 'Quận 2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  districts?: string[];

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
  bedrooms?: number;

  @ApiProperty({ example: ['south', 'southeast'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  houseDirections?: string[];

  @ApiProperty({ example: ['south'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  balconyDirections?: string[];

  @ApiProperty({
    example: 'newest',
    enum: ['newest', 'price_asc', 'price_desc', 'area_asc', 'area_desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string;
}

