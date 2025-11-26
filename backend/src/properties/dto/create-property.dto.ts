import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyStatus } from '@prisma/client';
import { PropertyTypeDefault } from '../enums/property-defaults.enum';

export class CreatePropertyDto {
  @ApiProperty({
    enum: PropertyTypeDefault,
    example: PropertyTypeDefault.TATCA,
    description: 'Loại bất động sản',
  })
  @IsEnum(PropertyTypeDefault)
  propertyType: PropertyTypeDefault;

  @ApiProperty({
    enum: PropertyStatus,
    example: PropertyStatus.FOR_SALE,
    description: 'Trạng thái giao dịch',
  })
  @IsEnum(PropertyStatus)
  propertyStatus: PropertyStatus;


  @ApiProperty({ example: 4, description: 'Số phòng ngủ' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beds: number;

  @ApiProperty({ example: 3, description: 'Số phòng tắm' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baths: number;

  @ApiProperty({ example: 120, description: 'Diện tích (m2)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ example: 3000, description: 'Giá chi tiết' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;


  @ApiProperty({ example: 'Mô tả chi tiết bất động sản' })
  @IsString()
  description: string;


  @ApiProperty({ example: 'Hồ Chí Minh' })
  @IsString()
  anyCity: string;

  @ApiProperty({ example: 'Phường Bến Nghé' })
  @IsString()
  anyWard: string;

  @ApiProperty({ example: 'Nhà hát Thành Phố' })
  @IsString()
  landmark: string;

}

