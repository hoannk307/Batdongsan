import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PropertySortDefault } from './enums/property-defaults.enum';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bất động sản mới' })
  create(@Request() req, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(req.user.userId, createPropertyDto);
  }

  @Post('with-files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo bất động sản mới kèm file đính kèm (transaction + Cloudflare upload)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        propertyType: { type: 'string', description: 'Loại bất động sản' },
        propertyStatus: { type: 'string', description: 'Trạng thái giao dịch' },
        beds: { type: 'number', description: 'Số phòng ngủ' },
        baths: { type: 'number', description: 'Số phòng tắm' },
        area: { type: 'number', description: 'Diện tích' },
        price: { type: 'number', description: 'Giá' },
        description: { type: 'string', description: 'Mô tả chi tiết' },
        anyCity: { type: 'string', description: 'Tỉnh/Thành phố' },
        anyWard: { type: 'string', description: 'Phường/Xã' },
        landmark: { type: 'string', description: 'Địa chỉ chi tiết' },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  createWithFiles(
    @Request() req,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.createWithFiles(req.user.userId, createPropertyDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bất động sản (hỗ trợ ?page=&limit=&sort=)' })
  findAll(@Query() query: SearchPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @Post('search')
  @ApiOperation({ summary: 'Tìm kiếm bất động sản nâng cao' })
  search(@Body() searchDto: SearchPropertyDto) {
    return this.propertiesService.search(searchDto);
  }

  @Get('defaults/options')
  @ApiOperation({ summary: 'Lấy các tùy chọn mặc định cho form bất động sản' })
  getDefaults() {
    return this.propertiesService.getDefaults();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bất động sản' })
  findOne(@Param('id') id: string) {
    const numId = +id;
    if (!Number.isFinite(numId) || numId <= 0) {
      return { error: 'ID không hợp lệ', statusCode: 400 };
    }
    return this.propertiesService.findOne(numId);
  }

  @Patch(':id/view')
  @ApiOperation({ summary: 'Tăng lượt xem bất động sản +1' })
  incrementView(@Param('id') id: string) {
    const numId = +id;
    if (!Number.isFinite(numId) || numId <= 0) {
      return { error: 'ID không hợp lệ', statusCode: 400 };
    }
    return this.propertiesService.incrementViewCount(numId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật bất động sản' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(+id, req.user.userId, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bất động sản' })
  remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(+id, req.user.userId);
  }
}

