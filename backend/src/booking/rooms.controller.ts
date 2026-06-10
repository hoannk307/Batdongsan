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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FileService } from '../file/file.service';
import { PrismaService } from '../prisma/prisma.service';
import { extname } from 'path';

@ApiTags('booking/rooms')
@Controller('booking/rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phòng của user' })
  findAll(@Request() req) {
    return this.roomsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phòng' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.roomsService.findOne(+id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo phòng mới' })
  create(@Request() req, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(req.user.userId, dto);
  }

  @Post('with-files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Tạo phòng mới kèm ảnh' })
  async createWithFiles(
    @Request() req,
    @Body() dto: CreateRoomDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const room = await this.roomsService.create(req.user.userId, dto);

    if (files && files.length > 0) {
      for (const file of files) {
        const originalName = file.originalname;
        const ext = extname(originalName).replace('.', '').toLowerCase();
        const keyPath = `BOOKING/${room.id}/${originalName}`;

        let logicalType = 'other';
        if (file.mimetype.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
          logicalType = 'image';
        }

        await this.prisma.$executeRaw`
          INSERT INTO file_attach (object_id, path, nghiepvu_code, type, extend, name)
          VALUES (${room.id}, ${keyPath}, 'BOOKING', ${logicalType}, ${ext}, ${originalName})
        `;

        await this.fileService.uploadFileWithKey(file, keyPath);
      }
    }

    return this.roomsService.findAll(req.user.userId).then((rooms) =>
      rooms.find((r) => r.id === room.id) || room,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật phòng' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(+id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phòng' })
  remove(@Request() req, @Param('id') id: string) {
    return this.roomsService.remove(+id, req.user.userId);
  }
}
