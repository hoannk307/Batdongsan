import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.bk_sources.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const source = await this.prisma.bk_sources.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('Source not found');
    if (source.user_id !== userId) throw new ForbiddenException('Not your source');
    return source;
  }

  async create(userId: number, dto: CreateSourceDto) {
    return this.prisma.bk_sources.create({
      data: {
        user_id: userId,
        name: dto.name,
        comment: dto.comment || null,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateSourceDto) {
    await this.findOne(id, userId);
    return this.prisma.bk_sources.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.bk_sources.delete({ where: { id } });
  }
}
