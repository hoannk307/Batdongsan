import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { Prisma, PropertyStatus } from '@prisma/client';
import {
  PropertyStatusDefault,
  PropertySortDefault,
  PropertyTypeDefault,
} from './enums/property-defaults.enum';
import { FileService } from '../file/file.service';
import { extname } from 'path';

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private readonly fileService: FileService,
  ) { }

  async findLatest(params: { page?: number; limit?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 6;
    const skip = (page - 1) * limit;

    const [rawProperties, total] = await Promise.all([
      this.prisma.properties.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.properties.count(),
    ]);

    const properties = await this.getPropertiesWithFiles(rawProperties);

    // ── Resolve address từ bảng locations (batch, tránh N+1) ────────────────
    const locationIds = [
      ...new Set([
        ...properties.map((p) => p.any_city).filter(Boolean),
        ...properties.map((p) => p.any_ward).filter(Boolean),
      ]),
    ]
      .map(Number)
      .filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const dataWithAddress = properties.map((p) => {
      const cityName = locationMap.get(p.any_city) ?? p.any_city ?? '';
      const wardName = locationMap.get(p.any_ward) ?? p.any_ward ?? '';
      const address = [cityName, wardName].filter(Boolean).join(', ');
      const price_string = this.formatPriceVND(Number(p.price));
      return { ...p, address, price_string };
    });

    return {
      data: dataWithAddress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured(params: { page?: number; limit?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where = { outstanding: true };

    const [rawProperties, total] = await Promise.all([
      this.prisma.properties.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.properties.count({ where }),
    ]);

    const properties = await this.getPropertiesWithFiles(rawProperties);

    // ── Resolve address từ bảng locations (batch, tránh N+1) ────────────────
    const locationIds = [
      ...new Set([
        ...properties.map((p) => p.any_city).filter(Boolean),
        ...properties.map((p) => p.any_ward).filter(Boolean),
      ]),
    ]
      .map(Number)
      .filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const dataWithAddress = properties.map((p) => {
      const cityName = locationMap.get(p.any_city) ?? p.any_city ?? '';
      const wardName = locationMap.get(p.any_ward) ?? p.any_ward ?? '';
      const address = [cityName, wardName].filter(Boolean).join(', ');
      const price_string = this.formatPriceVND(Number(p.price));
      return { ...p, address, price_string };
    });

    return {
      data: dataWithAddress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(userId: number, createPropertyDto: CreatePropertyDto) {
    const property = await this.prisma.properties.create({
      data: {
        ...createPropertyDto,
        user_id: userId,
      },
    });

    return this.getPropertyWithFiles(property);
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
    try {
      // Không có file thì dùng luồng cũ để giữ nguyên hành vi
      if (!files || files.length === 0) {
        return await this.create(userId, createPropertyDto);
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
        const keyPath = `BDS/NHATRANG/${originalName}`;

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

      return this.getPropertyWithFiles(property);
    } catch (error) {
      Logger.error(`Error in createWithFiles: ${error.message}`, error.stack, 'PropertiesService');
      throw new InternalServerErrorException(
        error.message || 'Có lỗi xảy ra khi tạo bất động sản với file đính kèm'
      );
    }
  }

  async findAdminList(userId: number, page = 1, limit = 20) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    const skip = (page - 1) * limit;

    const where: Prisma.propertiesWhereInput = {};
    if (user && user.role !== 'ADMIN') {
      where.user_id = userId;
    }

    const [rawProperties, total] = await Promise.all([
      this.prisma.properties.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.properties.count({ where }),
    ]);

    const properties = await this.getPropertiesWithFiles(rawProperties);

    const locationIds = [
      ...new Set([
        ...properties.map((p) => p.any_city).filter(Boolean),
        ...properties.map((p) => p.any_ward).filter(Boolean),
      ]),
    ].map(Number).filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const dataWithAddress = properties.map((p) => {
      const cityName = locationMap.get(p.any_city) ?? p.any_city ?? '';
      const wardName = locationMap.get(p.any_ward) ?? p.any_ward ?? '';
      const address = [cityName, wardName].filter(Boolean).join(', ');
      const price_string = this.formatPriceVND(Number(p.price));
      return { ...p, address, price_string };
    });

    return {
      data: dataWithAddress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    const [rawProperties, total] = await Promise.all([
      this.prisma.properties.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.properties.count({ where }),
    ]);

    const properties = await this.getPropertiesWithFiles(rawProperties);

    // ── Resolve address từ bảng locations (batch, tránh N+1) ────────────────
    const locationIds = [
      ...new Set([
        ...properties.map((p) => p.any_city).filter(Boolean),
        ...properties.map((p) => p.any_ward).filter(Boolean),
      ]),
    ]
      .map(Number)
      .filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const dataWithAddress = properties.map((p) => {
      const cityName = locationMap.get(p.any_city) ?? p.any_city ?? '';
      const wardName = locationMap.get(p.any_ward) ?? p.any_ward ?? '';
      const address = [cityName, wardName].filter(Boolean).join(', ');
      const price_string = this.formatPriceVND(Number(p.price));
      return { ...p, address, price_string };
    });

    return {
      data: dataWithAddress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const rawProperty = await this.prisma.properties.findUnique({
      where: { id },
    });

    if (!rawProperty) {
      throw new NotFoundException('Property not found');
    }

    const property = await this.getPropertyWithFiles(rawProperty);

    // ── Resolve address & price_string ──────────────────────────────────────
    const locationIds = [property.any_city, property.any_ward]
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>();
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const cityName = locationMap.get(property.any_city) ?? property.any_city ?? '';
    const wardName = locationMap.get(property.any_ward) ?? property.any_ward ?? '';
    const address = [cityName, wardName].filter(Boolean).join(', ');
    const price_string = this.formatPriceVND(Number(property.price));

    return { ...property, address, price_string, cityName, wardName };
  }

  /**
   * Tăng lượt xem +1 theo kiểu atomic (tránh race condition).
   * Dùng Prisma update với increment thay vì đọc rồi ghi.
   */
  async incrementViewCount(id: number): Promise<{ view_count: number }> {
    const updated = await this.prisma.properties.update({
      where: { id },
      data: { view_count: { increment: 1 } },
      select: { view_count: true },
    });
    return updated;
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

    const updatedProperty = await this.prisma.properties.update({
      where: { id },
      data: updatePropertyDto,
    });

    return this.getPropertyWithFiles(updatedProperty);
  }

  async remove(id: number, userId: number) {
    const property = await this.prisma.properties.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    const isAdmin = user && user.role === 'ADMIN';

    if (property.user_id !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    const propertyWithFiles = await this.getPropertyWithFiles(property);

    await this.prisma.$transaction(async (tx) => {
      await tx.file_attach.deleteMany({
        where: { object_id: id, nghiepvu_code: 'BDS' },
      });
      await tx.properties.delete({
        where: { id },
      });
    });

    if (propertyWithFiles && propertyWithFiles.file_attach) {
      for (const file of propertyWithFiles.file_attach) {
        if (file.path) {
          await this.fileService.deleteFile(file.path);
        }
      }
    }

    return { message: 'Deleted successfully' };
  }

  /**
   * Tìm kiếm bất động sản nâng cao qua POST body.
   * Tương ứng với frontend route: POST /api/batdongsan/search
   *
   * Sử dụng SearchPropertyDto (camelCase) thay vì FilterPropertyDto (snake_case)
   * để keep consistent với convention NestJS / class-validator.
   */
  async search(searchDto: SearchPropertyDto) {
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
    } = searchDto;

    const skip = (page - 1) * limit;

    // ── Build where clause ──────────────────────────────────────────────────
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

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {};
      if (minArea !== undefined) where.area.gte = minArea;
      if (maxArea !== undefined) where.area.lte = maxArea;
    }

    if (minBeds !== undefined) {
      where.beds = { gte: minBeds };
    }

    if (minBaths !== undefined) {
      where.baths = { gte: minBaths };
    }

    // ── Build orderBy ───────────────────────────────────────────────────────
    let orderBy: Prisma.propertiesOrderByWithRelationInput;
    switch (sort) {
      case PropertySortDefault.PRICE_ASC:
        orderBy = { price: 'asc' };
        break;
      case PropertySortDefault.PRICE_DESC:
        orderBy = { price: 'desc' };
        break;
      case PropertySortDefault.AREA_ASC:
        orderBy = { area: 'asc' };
        break;
      case PropertySortDefault.AREA_DESC:
        orderBy = { area: 'desc' };
        break;
      case PropertySortDefault.NEWEST:
      default:
        orderBy = { created_at: 'desc' };
        break;
    }

    // ── Query DB ────────────────────────────────────────────────────────────
    const [rawProperties, total] = await Promise.all([
      this.prisma.properties.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.properties.count({ where }),
    ]);

    const properties = await this.getPropertiesWithFiles(rawProperties);

    // ── Resolve address từ bảng locations (batch, tránh N+1) ────────────────
    // any_city / any_ward lưu id (số nguyên dạng string), map theo id
    const locationIds = [
      ...new Set([
        ...properties.map((p) => p.any_city).filter(Boolean),
        ...properties.map((p) => p.any_ward).filter(Boolean),
      ]),
    ]
      .map(Number)
      .filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>(); // key: String(id), value: name
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const dataWithAddress = properties.map((p) => {
      const cityName = locationMap.get(p.any_city) ?? p.any_city ?? '';
      const wardName = locationMap.get(p.any_ward) ?? p.any_ward ?? '';
      const address = [cityName, wardName].filter(Boolean).join(', ');
      const price_string = this.formatPriceVND(Number(p.price));
      return { ...p, address, price_string };
    });

    return {
      data: dataWithAddress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách bất động sản theo các điều kiện lọc (flat query params)
   * Dùng cho endpoint GET /properties/filter
   *
   * @param filterDto - Các tham số lọc truyền qua query string
   */
  async findByFilter(filterDto: FilterPropertyDto) {
    const {
      page = 1,
      limit = 10,
      property_type,
      property_status,
      beds,
      baths,
      area_min,
      area_max,
      price_min,
      price_max,
      any_city,
      any_ward,
      landmark,
      sort = PropertySortDefault.NEWEST,
    } = filterDto;

    const skip = (page - 1) * limit;

    // ── Build where clause ──────────────────────────────────────────────────
    const where: Prisma.propertiesWhereInput = {};

    if (property_type) {
      where.property_type = property_type;
    }

    if (property_status) {
      where.property_status = property_status;
    }

    // Số phòng ngủ / phòng tắm tối thiểu
    if (beds !== undefined) {
      where.beds = { gte: beds };
    }

    if (baths !== undefined) {
      where.baths = { gte: baths };
    }

    // Khoảng diện tích
    if (area_min !== undefined || area_max !== undefined) {
      where.area = {};
      if (area_min !== undefined) where.area.gte = area_min;
      if (area_max !== undefined) where.area.lte = area_max;
    }

    // Khoảng giá
    if (price_min !== undefined || price_max !== undefined) {
      where.price = {};
      if (price_min !== undefined) where.price.gte = price_min;
      if (price_max !== undefined) where.price.lte = price_max;
    }

    // Vị trí — tìm kiếm gần đúng (contains) để linh hoạt hơn
    if (any_city) {
      where.any_city = { contains: any_city };
    }

    if (any_ward) {
      where.any_ward = { contains: any_ward };
    }

    if (landmark) {
      where.landmark = { contains: landmark };
    }

    // ── Build orderBy ───────────────────────────────────────────────────────
    let orderBy: Prisma.propertiesOrderByWithRelationInput;
    switch (sort) {
      case PropertySortDefault.PRICE_ASC:
        orderBy = { price: 'asc' };
        break;
      case PropertySortDefault.PRICE_DESC:
        orderBy = { price: 'desc' };
        break;
      case PropertySortDefault.AREA_ASC:
        orderBy = { area: 'asc' };
        break;
      case PropertySortDefault.AREA_DESC:
        orderBy = { area: 'desc' };
        break;
      case PropertySortDefault.NEWEST:
      default:
        orderBy = { created_at: 'desc' };
        break;
    }

    // ── Query DB ────────────────────────────────────────────────────────────
    const [rawProperties, total] = await Promise.all([
      this.prisma.properties.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.properties.count({ where }),
    ]);

    const properties = await this.getPropertiesWithFiles(rawProperties);

    // ── Resolve address từ bảng locations (batch, tránh N+1) ────────────────
    const locationIds = [
      ...new Set([
        ...properties.map((p) => p.any_city).filter(Boolean),
        ...properties.map((p) => p.any_ward).filter(Boolean),
      ]),
    ]
      .map(Number)
      .filter((n) => !isNaN(n));

    const locationMap = new Map<string, string>(); // key: String(id), value: name
    if (locationIds.length > 0) {
      const locations = await this.prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      });
      locations.forEach((loc) => locationMap.set(String(loc.id), loc.name));
    }

    const dataWithAddress = properties.map((p) => {
      const cityName = locationMap.get(p.any_city) ?? p.any_city ?? '';
      const wardName = locationMap.get(p.any_ward) ?? p.any_ward ?? '';
      const address = [cityName, wardName].filter(Boolean).join(', ');
      const price_string = this.formatPriceVND(Number(p.price));
      return { ...p, address, price_string };
    });

    return {
      data: dataWithAddress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  /**
   * Chuyển đổi giá (VND) sang chuỗi dạng "X tỷ Y triệu".
   * Chỉ dừng ở hàng tỷ và triệu, bỏ qua phần nhỏ hơn triệu.
   */
  private formatPriceVND(price: number): string {
    if (!price || price <= 0) return '';
    const ty = Math.floor(price / 1_000_000_000);
    const trieu = Math.floor((price % 1_000_000_000) / 1_000_000);
    const parts: string[] = [];
    if (ty > 0) parts.push(`${ty} tỷ`);
    if (trieu > 0) parts.push(`${trieu} triệu`);
    return parts.join(' ') || '0';
  }

  private async getPropertiesWithFiles(properties: any[]) {
    if (!properties || properties.length === 0) return properties;
    const propertyIds = properties.map(p => p.id);
    const fileAttaches = await this.prisma.file_attach.findMany({
      where: {
        object_id: { in: propertyIds },
        nghiepvu_code: 'BDS',
      }
    });

    const fileMap = new Map<number, any[]>();
    for (const file of fileAttaches) {
      if (!fileMap.has(file.object_id)) {
        fileMap.set(file.object_id, []);
      }
      fileMap.get(file.object_id)!.push(file);
    }

    return properties.map(p => ({
      ...p,
      file_attach: fileMap.get(p.id) || [],
    }));
  }

  private async getPropertyWithFiles(property: any) {
    if (!property) return property;
    const fileAttaches = await this.prisma.file_attach.findMany({
      where: {
        object_id: property.id,
        nghiepvu_code: 'BDS',
      }
    });
    return {
      ...property,
      file_attach: fileAttaches,
    };
  }
}
