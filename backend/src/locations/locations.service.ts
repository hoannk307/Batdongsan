import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async getProvinces() {
    return this.prisma.location.findMany({
      where: {
        type: 'PROVINCE',
        level: 1,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getWards(provinceId: number) {
    return this.prisma.location.findMany({
      where: {
        type: 'WARD',
        level: 2,
        parentId: provinceId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

