import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { Prisma, PropertyStatus } from '@prisma/client';
import {
  PropertyStatusDefault,
  PropertyTypeDefault,
} from './enums/property-defaults.enum';
import { FileService } from '../file/file.service';
import { extname } from 'path';

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async create(userId: number, createPropertyDto: CreatePropertyDto) {
    const property = await this.prisma.properties.create({
      data: {
        ...createPropertyDto,
        user_id: userId,
      },
      include: {
        file_attach: true,
      },
    });

    return property;
  }

  /**
   * Tạo bất động sản và đồng thời lưu thông tin file đính kèm (file_attach) trong transaction.
   * Sau khi transaction DB (property + file_attach) thành công thì mới upload file lên Cloudflare R2.
   */
  async createWithFiles(
    userId: number,
    createPropertyDto: CreatePropertyDto,
    files: Express.Multer.File[] = [],
  ) {
    // Không có file thì dùng luồng cũ để giữ nguyên hành vi
    if (!files || files.length === 0) {
      return this.create(userId, createPropertyDto);
    }

    // Chuẩn bị metadata cho từng file
    const fileMetas = files.map((file) => {
      const originalName = file.originalname;
      const ext = extname(originalName).replace('.', '').toLowerCase();

      // Xác định loại file (word, excel, image, pdf, other...)
      let logicalType = 'other';
      if (['doc', 'docx'].includes(ext)) {
        logicalType = 'word';
      } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        logicalType = 'excel';
      } else if (file.mimetype.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        logicalType = 'image';
      } else if (ext === 'pdf') {
        logicalType = 'pdf';
      }

      // Đường dẫn lưu trên Cloudflare R2 theo yêu cầu
      const keyPath = `batdongsan/BDS/NHATRANG/${originalName}`;

      return {
        file,
        keyPath,
        ext,
        logicalType,
        name: originalName,
      };
    });

    // Transaction: tạo property + insert vào bảng file_attach
    const property = await this.prisma.$transaction(async (tx) => {
      const createdProperty = await tx.properties.create({
        data: {
          ...createPropertyDto,
          user_id: userId,
        },
        include: {
          file_attach: true,
        },
      });

      for (const meta of fileMetas) {
        await tx.$executeRaw`
          INSERT INTO file_attach (object_id, path, nghiepvu_code, type, extend, name)
          VALUES (${createdProperty.id}, ${meta.keyPath}, 'BDS', ${meta.logicalType}, ${meta.ext}, ${meta.name})
        `;
      }

      return createdProperty;
    });

    // Sau khi transaction DB thành công, mới upload file lên Cloudflare
    for (const meta of fileMetas) {
      await this.fileService.uploadFileWithKey(meta.file, meta.keyPath);
    }

    return property;
  }

  async findAll(query: SearchPropertyDto) {
    const {
      page = 1,
      limit = 20,
      propertyStatus,
      propertyTypes,
      cities,
      wards,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      minBeds,
      minBaths,
      sort = 'newest',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.propertiesWhereInput = {};

    if (propertyStatus) {
      where.property_status = propertyStatus;
    }

    if (propertyTypes && propertyTypes.length > 0) {
      where.property_type = { in: propertyTypes };
    }

    if (cities && cities.length > 0) {
      where.any_city = { in: cities };
    }

    if (wards && wards.length > 0) {
      where.any_ward = { in: wards };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = minArea;
      if (maxArea) where.area.lte = maxArea;
    }

    if (minBeds) {
      where.beds = { gte: minBeds };
    }

    if (minBaths) {
      where.baths = { gte: minBaths };
    }

    // Build orderBy
    let orderBy: Prisma.propertiesOrderByWithRelationInput = {};
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
        orderBy = { created_at: 'desc' };
        break;
    }

    const [properties, total] = await Promise.all([
      this.prisma.properties.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          file_attach: true,
        },
      }),
      this.prisma.properties.count({ where }),
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
    const property = await this.prisma.properties.findUnique({
      where: { id },
      include: {
        file_attach: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: number, userId: number, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.prisma.properties.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.user_id !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    return this.prisma.properties.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        file_attach: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    const property = await this.prisma.properties.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    return this.prisma.properties.delete({
      where: { id },
    });
  }

  async search(searchDto: SearchPropertyDto) {
    return this.findAll(searchDto);
  }

  getDefaults() {
    const propertyTypes = Object.values(PropertyTypeDefault).map(
      (value) => ({
        id: value,
        name: value,
      }),
    );

    const propertyStatuses = Object.keys(PropertyStatusDefault).map(
      (key) => ({
        id: PropertyStatus[key as keyof typeof PropertyStatus],
        name: PropertyStatusDefault[key as keyof typeof PropertyStatusDefault],
      }),
    );

    return {
      propertyTypes,
      propertyStatuses,
    };
  }
}
