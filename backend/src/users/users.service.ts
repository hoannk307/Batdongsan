import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar: true,
        created_at: true,
      },
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
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id=${id}`);
    }

    return user;
  }
}

