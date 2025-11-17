import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tin tức mới (Admin only)' })
  create(@Request() req, @Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(req.user.userId, createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tin tức' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.newsService.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
      category,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tin tức theo ID' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết tin tức theo slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật tin tức' })
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(+id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tin tức' })
  remove(@Param('id') id: string) {
    return this.newsService.remove(+id);
  }
}

