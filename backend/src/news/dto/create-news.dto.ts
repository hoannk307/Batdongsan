import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewsStatus } from '@prisma/client';

export class CreateNewsDto {
  @ApiProperty({ example: 'Thị trường bất động sản 2024' })
  @IsString()
  title: string;

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
  featuredImage?: string;

  @ApiProperty({ example: 'market', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: NewsStatus, default: NewsStatus.DRAFT })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}

