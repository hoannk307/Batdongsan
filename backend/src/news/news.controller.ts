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
  UseInterceptors,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tin tức mới (Admin only)' })
  create(@Request() req, @Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(req.user.userId, createNewsDto);
  }

  @Post('with-files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo tin tức mới kèm file đính kèm (transaction + Cloudflare upload)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Tiêu đề' },
        slug: { type: 'string', description: 'Slug URL' },
        summary: { type: 'string', description: 'Tóm tắt' },
        content: { type: 'string', description: 'Nội dung HTML' },
        category: { type: 'integer', description: 'ID danh mục (số nguyên)' },
        status: { type: 'string', description: 'DRAFT hoặc PUBLISHED' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  createWithFiles(
    @Request() req,
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.newsService.createWithFiles(req.user.userId, createNewsDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tin tức' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.newsService.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
    );
  }

  @Get('latest')
  @ApiOperation({ summary: 'Lấy danh sách 6 tin tức mới nhất' })
  findLatest(@Query('category') category?: string) {
    return this.newsService.findLatest(6, category);
  }

  @Get('tags/:tagId')
  @ApiOperation({ summary: 'Lấy danh sách tin tức theo Tag ID' })
  findByTag(
    @Param('tagId') tagId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.newsService.findByTag(+tagId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy danh sách tin tức theo Category ID' })
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.newsService.findByCategory(+categoryId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách danh mục tin tức (news_catelog)' })
  findAllCategories() {
    return this.newsService.findAllCategories();
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
