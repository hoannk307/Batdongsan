import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const rooms = await this.prisma.bk_rooms.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    // Attach images from file_attach
    const roomIds = rooms.map((r) => r.id);
    const files = await this.prisma.file_attach.findMany({
      where: {
        object_id: { in: roomIds },
        nghiepvu_code: 'BOOKING',
      },
    });

    const fileMap = new Map<number, any[]>();
    for (const file of files) {
      if (!fileMap.has(file.object_id)) {
        fileMap.set(file.object_id, []);
      }
      fileMap.get(file.object_id)!.push(file);
    }

    return rooms.map((room) => ({
      ...room,
      files: fileMap.get(room.id) || [],
      img: (fileMap.get(room.id) || [])[0]?.path || null,
    }));
  }

  async findOne(id: number, userId: number) {
    const room = await this.prisma.bk_rooms.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.user_id !== userId) throw new ForbiddenException('Not your room');
    return room;
  }

  async create(userId: number, dto: CreateRoomDto) {
    return this.prisma.bk_rooms.create({
      data: {
        user_id: userId,
        name: dto.name,
        comment: dto.comment || null,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateRoomDto) {
    const room = await this.findOne(id, userId);
    return this.prisma.bk_rooms.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.bk_rooms.delete({ where: { id } });
  }
}
