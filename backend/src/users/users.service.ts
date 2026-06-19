import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(keyword?: string) {
    return this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar: true,
        is_blocked: true,
        created_at: true,
      },
      where: keyword
        ? {
            OR: [
              { username: { contains: keyword, mode: 'insensitive' } },
              { email: { contains: keyword, mode: 'insensitive' } },
              { full_name: { contains: keyword, mode: 'insensitive' } },
              { phone: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar: true,
        is_blocked: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id=${id}`);
    }

    return user;
  }

  async update(id: number, data: { full_name?: string; phone?: string; role?: string }) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user với id=${id}`);

    return this.prisma.users.update({
      where: { id },
      data: {
        ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.role !== undefined ? { role: data.role as any } : {}),
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar: true,
        is_blocked: true,
        created_at: true,
      },
    });
  }

  async toggleBlock(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user với id=${id}`);

    return this.prisma.users.update({
      where: { id },
      data: {
        is_blocked: !user.is_blocked,
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        is_blocked: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user với id=${id}`);

    await this.prisma.users.delete({ where: { id } });
    return { message: `Đã xóa user id=${id}` };
  }
}
