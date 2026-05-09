import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ example: 20, description: 'Số mục mỗi trang' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Tổng số bản ghi' })
  total: number;

  @ApiProperty({ example: 5, description: 'Tổng số trang' })
  totalPages: number;
}

export class PropertyItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'FOR_SALE' })
  property_status: string;

  @ApiProperty({ example: 'Nhà đất' })
  property_type: string;

  @ApiProperty({ example: 1500000000 })
  price: number;

  @ApiProperty({ example: 85 })
  area: number;

  @ApiProperty({ example: 3 })
  beds: number;

  @ApiProperty({ example: 2 })
  baths: number;

  @ApiProperty({ example: 'Nha Trang' })
  any_city: string;

  @ApiProperty({ example: 'Phường Vĩnh Hải' })
  any_ward: string;

  @ApiProperty({ example: 'Gần biển' })
  landmark: string;

  @ApiProperty({ example: '2026-04-28T00:00:00.000Z' })
  created_at: string;
}

export class SearchResultDto {
  @ApiProperty({ type: [PropertyItemDto] })
  data: PropertyItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
