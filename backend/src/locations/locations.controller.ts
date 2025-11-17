import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Lấy danh sách tỉnh/thành phố' })
  getProvinces() {
    return this.locationsService.getProvinces();
  }

  @Get('wards')
  @ApiOperation({ summary: 'Lấy danh sách phường/xã theo tỉnh' })
  getWards(@Query('province_id') provinceId: string) {
    return this.locationsService.getWards(+provinceId);
  }
}

