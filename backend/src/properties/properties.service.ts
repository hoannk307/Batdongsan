import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createPropertyDto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        ...createPropertyDto,
        userId,
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    return property;
  }

  async findAll(query: SearchPropertyDto) {
    const {
      page = 1,
      limit = 20,
      purpose,
      types,
      provinces,
      districts,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      houseDirections,
      balconyDirections,
      sort = 'newest',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      status: 'ACTIVE',
    };

    if (purpose && purpose !== 'all') {
      where.purpose = purpose as any;
    }

    if (types && types.length > 0) {
      where.type = { in: types as any[] };
    }

    if (provinces && provinces.length > 0) {
      where.province = { in: provinces };
    }

    if (districts && districts.length > 0) {
      where.district = { in: districts };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = new Prisma.Decimal(minArea);
      if (maxArea) where.area.lte = new Prisma.Decimal(maxArea);
    }

    if (bedrooms) {
      where.bedrooms = { gte: bedrooms };
    }

    if (houseDirections && houseDirections.length > 0) {
      where.houseDirection = { in: houseDirections };
    }

    if (balconyDirections && balconyDirections.length > 0) {
      where.balconyDirection = { in: balconyDirections };
    }

    // Build orderBy
    let orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'area_asc':
        orderBy = { area: 'asc' };
        break;
      case 'area_desc':
        orderBy = { area: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Increment views
    await this.prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return property;
  }

  async update(id: number, userId: number, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        images: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    return this.prisma.property.delete({
      where: { id },
    });
  }

  async search(searchDto: SearchPropertyDto) {
    return this.findAll(searchDto);
  }
}

