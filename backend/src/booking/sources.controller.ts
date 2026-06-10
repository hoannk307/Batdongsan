import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@ApiTags('booking/sources')
@Controller('booking/sources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nguồn khách' })
  findAll(@Request() req) {
    return this.sourcesService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo nguồn khách mới' })
  create(@Request() req, @Body() dto: CreateSourceDto) {
    return this.sourcesService.create(req.user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nguồn khách' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateSourceDto) {
    return this.sourcesService.update(+id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nguồn khách' })
  remove(@Request() req, @Param('id') id: string) {
    return this.sourcesService.remove(+id, req.user.userId);
  }
}
