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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { SearchResultDto } from './dto/search-result.dto';
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

  /**
   * POST /properties/search
   *
   * Tìm kiếm bất động sản nâng cao bằng POST body (JSON).
   * Tương ứng với frontend route: POST /api/batdongsan/search
   *
   * Tất cả các trường trong body đều optional.
   * Ví dụ body:
   * {
   *   "propertyStatus": "FOR_SALE",
   *   "propertyTypes": ["Nhà đất"],
   *   "cities": ["Nha Trang"],
   *   "minPrice": 1000000000,
   *   "maxPrice": 5000000000,
   *   "minBeds": 2,
   *   "minBaths": 1,
   *   "minArea": 50,
   *   "maxArea": 200,
   *   "sort": "price_asc",
   *   "page": 1,
   *   "limit": 20
   * }
   */
  @Post('search')
  @ApiOperation({
    summary: 'Tìm kiếm bất động sản nâng cao (POST body)',
    description:
      'Gửi bộ lọc qua POST body JSON. Tất cả các trường đều optional. ' +
      'Hỗ trợ: propertyStatus, propertyTypes[], cities[], wards[], ' +
      'minPrice, maxPrice, minArea, maxArea, minBeds, minBaths, sort, page, limit.',
  })
  @ApiBody({
    type: SearchPropertyDto,
    examples: {
      forSale: {
        summary: 'Tìm bất động sản đang bán',
        value: {
          propertyStatus: 'FOR_SALE',
          propertyTypes: ['Nhà đất'],
          cities: ['Nha Trang'],
          minPrice: 500000000,
          maxPrice: 5000000000,
          minBeds: 2,
          sort: 'price_asc',
          page: 1,
          limit: 20,
        },
      },
      forRent: {
        summary: 'Tìm bất động sản cho thuê',
        value: {
          propertyStatus: 'FOR_RENT',
          minBeds: 1,
          sort: 'newest',
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bất động sản phù hợp với bộ lọc',
    type: SearchResultDto,
  })
  @ApiResponse({ status: 400, description: 'Body không hợp lệ' })
  search(@Body() searchDto: SearchPropertyDto) {
    return this.propertiesService.search(searchDto);
  }

  @Get('defaults/options')
  @ApiOperation({ summary: 'Lấy các tùy chọn mặc định cho form bất động sản' })
  getDefaults() {
    return this.propertiesService.getDefaults();
  }

  /**
   * GET /properties/filter
   *
   * Lấy danh sách bất động sản theo bộ lọc (filter search).
   * Tất cả params đều optional, truyền qua query string.
   *
   * Ví dụ:
   *   GET /properties/filter?property_type=Nhà đất&property_status=FOR_SALE&beds=2&price_min=500000000&sort=price_asc
   *
   * QUAN TRỌNG: Route này phải đứng TRƯỚC @Get(':id') để tránh NestJS
   * nhận nhầm chữ "filter" là một :id.
   */
  @Get('filter')
  @ApiOperation({
    summary: 'Lọc danh sách bất động sản theo thuộc tính',
    description:
      'Hỗ trợ lọc theo: property_type, property_status, beds, baths, area_min/max, price_min/max, any_city, any_ward, landmark, sort, page, limit',
  })
  findByFilter(@Query() filterDto: FilterPropertyDto) {
    console.log("filterDto", filterDto);
    return this.propertiesService.findByFilter(filterDto);
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

