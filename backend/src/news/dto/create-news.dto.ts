import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NewsStatus } from '@prisma/client';

export class CreateNewsDto {
  @ApiProperty({ example: 'Thị trường bất động sản 2024' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'thi-truong-bat-dong-san-2024', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Tóm tắt bài viết...', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ example: 'Nội dung bài viết chi tiết...' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  featured_image?: string;

  @ApiProperty({ example: 1, required: false, description: 'ID danh mục (số nguyên)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : value))
  category?: number;

  @ApiProperty({ enum: NewsStatus, default: NewsStatus.DRAFT })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiProperty({ example: ['market', 'policy'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return value.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return value;
  })
  tags?: string[];
}

