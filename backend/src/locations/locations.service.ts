import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async getProvinces() {
    return this.prisma.locations.findMany({
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
    return this.prisma.locations.findMany({
      where: {
        type: 'WARD',
        level: 2,
        parent_id: provinceId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

