import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { FileService } from '../file/file.service';
import { extname } from 'path';

function normalizeTagName(tag: string) {
  return String(tag || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeTagNames(tags?: string[]) {
  if (!Array.isArray(tags)) return [];
  return Array.from(new Set(tags.map(normalizeTagName).filter(Boolean)));
}

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private readonly fileService: FileService,
  ) { }

  /**
   * Lấy toàn bộ danh sách danh mục tin tức từ bảng news_catelog.
   */
  async findAllCategories() {
    return this.prisma.news_catelog.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async create(userId: number, createNewsDto: CreateNewsDto) {
    const slug =
      createNewsDto.slug?.trim() ? createNewsDto.slug.trim() : this.generateSlug(createNewsDto.title);

    const { tags: rawTags, ...restDto } = createNewsDto as any;
    const tagNames = normalizeTagNames(rawTags);

    const news = await this.prisma.news.create({
      data: {
        ...restDto,
        // Ensure slug is always set (required by DB) while still allowing manual override from DTO.
        slug,
        user_id: userId,
        published_at: createNewsDto.status === 'PUBLISHED' ? new Date() : null,
        updated_at: new Date(),
        ...(tagNames.length > 0
          ? {
            tags: {
              connectOrCreate: tagNames.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }
          : {}),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    return this.getNewsWithFiles(news);
  }

  /**
   * Tạo tin tức và đồng thời lưu thông tin file đính kèm (file_attach) trong transaction.
   * Sau khi transaction DB thành công thì mới upload file lên Cloudflare R2.
   * Pattern tương tự PropertiesService.createWithFiles().
   */
  async createWithFiles(
    userId: number,
    createNewsDto: CreateNewsDto,
    files: Express.Multer.File[] = [],
  ) {
    try {
      // Không có file thì dùng luồng cũ
      if (!files || files.length === 0) {
        return await this.create(userId, createNewsDto);
      }

      const slug =
        createNewsDto.slug?.trim() ? createNewsDto.slug.trim() : this.generateSlug(createNewsDto.title);

      const { tags: rawTags, ...restDto } = createNewsDto as any;
      const tagNames = normalizeTagNames(rawTags);

      // Chuẩn bị metadata cho từng file
      const fileMetas = files.map((file) => {
        const originalName = file.originalname;
        const ext = extname(originalName).replace('.', '').toLowerCase();

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

        const keyPath = `NEWS/${originalName}`;

        return {
          file,
          keyPath,
          ext,
          logicalType,
          name: originalName,
        };
      });

      // Transaction: tạo news + insert file_attach
      const news = await this.prisma.$transaction(async (tx) => {
        const createdNews = await tx.news.create({
          data: {
            ...restDto,
            slug,
            user_id: userId,
            published_at: createNewsDto.status === 'PUBLISHED' ? new Date() : null,
            updated_at: new Date(),
            ...(tagNames.length > 0
              ? {
                tags: {
                  connectOrCreate: tagNames.map((name) => ({
                    where: { name },
                    create: { name },
                  })),
                },
              }
              : {}),
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                full_name: true,
              },
            },
            tags: { select: { id: true, name: true, slug: true } },
          },
        });

        for (const meta of fileMetas) {
          await tx.$executeRaw`
            INSERT INTO file_attach (object_id, path, nghiepvu_code, type, extend, name)
            VALUES (${createdNews.id}, ${meta.keyPath}, 'NEWS', ${meta.logicalType}, ${meta.ext}, ${meta.name})
          `;
        }

        return createdNews;
      });

      // Upload file lên Cloudflare sau khi transaction DB thành công
      for (const meta of fileMetas) {
        await this.fileService.uploadFileWithKey(meta.file, meta.keyPath);
      }

      return this.getNewsWithFiles(news);
    } catch (error) {
      Logger.error(`Error in createWithFiles: ${error.message}`, error.stack, 'NewsService');
      throw new InternalServerErrorException(
        error.message || 'Có lỗi xảy ra khi tạo tin tức với file đính kèm'
      );
    }
  }

  async findAll(page = 1, limit = 20, status?: string, category?: string, tag?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category && !isNaN(Number(category))) {
      where.category = Number(category);
    }
    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    const [news, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              full_name: true,
            },
          },
          tags: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    const dataWithFiles = await this.getNewsListWithFiles(news);

    return {
      data: dataWithFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    // Increment views
    await this.prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return this.getNewsWithFiles(news);
  }

  async findBySlug(slug: string) {
    const news = await this.prisma.news.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    await this.prisma.news.update({
      where: { id: news.id },
      data: { views: { increment: 1 } },
    });

    return this.getNewsWithFiles(news);
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const existingNews = await this.prisma.news.findUnique({ where: { id } });

    if (!existingNews) {
      throw new NotFoundException('News not found');
    }

    const { tags: rawTags, ...restDto } = updateNewsDto as any;
    const data: any = { ...restDto };
    const shouldSyncTags = updateNewsDto.tags !== undefined;
    const tagNames = shouldSyncTags ? normalizeTagNames(rawTags) : [];

    // Priority:
    // 1) If client provided slug explicitly, use it.
    // 2) Otherwise, if title changed, regenerate slug from title.
    if (updateNewsDto.slug?.trim()) {
      data.slug = updateNewsDto.slug.trim();
    } else if (updateNewsDto.title && updateNewsDto.title !== existingNews.title) {
      data.slug = this.generateSlug(updateNewsDto.title);
    }

    if (updateNewsDto.status === 'PUBLISHED' && existingNews.status === 'DRAFT') {
      data.published_at = new Date();
    }

    // Sync tags only when client provided `tags` field (even empty array => clear).
    if (shouldSyncTags) {
      await this.prisma.$transaction(async (tx) => {
        if (tagNames.length > 0) {
          const existingTags = await tx.tags.findMany({
            where: { name: { in: tagNames } },
            select: { id: true, name: true },
          });
          const existingNames = new Set(existingTags.map((t) => t.name));
          const toCreate = tagNames.filter((name) => !existingNames.has(name));

          if (toCreate.length > 0) {
            await tx.tags.createMany({
              data: toCreate.map((name) => ({ name })),
              skipDuplicates: true,
            });
          }

          const finalTags = await tx.tags.findMany({
            where: { name: { in: tagNames } },
            select: { id: true, name: true },
          });

          data.tags = { set: finalTags.map((t) => ({ id: t.id })) };
        } else {
          data.tags = { set: [] };
        }

        await tx.news.update({
          where: { id },
          data,
          include: {
            users: {
              select: {
                id: true,
                username: true,
                full_name: true,
              },
            },
            tags: { select: { id: true, name: true, slug: true } },
          },
        });
      });

      // Re-fetch after tag sync to return tags accurately.
      const updatedNews = await this.prisma.news.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              full_name: true,
            },
          },
          tags: { select: { id: true, name: true, slug: true } },
        },
      });
      return this.getNewsWithFiles(updatedNews);
    }

    const updatedNews = await this.prisma.news.update({
      where: { id },
      data,
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    return this.getNewsWithFiles(updatedNews);
  }

  async remove(id: number) {
    return this.prisma.news.delete({
      where: { id },
    });
  }

  async findLatest(limit = 6, category?: string) {
    const newsList = await this.prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category ? { category: Number(category) } : { category: 1 }),
      },
      take: limit,
      orderBy: {
        published_at: 'desc',
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    return this.getNewsListWithFiles(newsList);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async getNewsListWithFiles(newsList: any[]) {
    if (!newsList || newsList.length === 0) return newsList;
    const newsIds = newsList.map(n => n.id);
    const fileAttaches = await this.prisma.file_attach.findMany({
      where: {
        object_id: { in: newsIds },
        nghiepvu_code: 'NEWS',
      }
    });

    const fileMap = new Map<number, any[]>();
    for (const file of fileAttaches) {
      if (!fileMap.has(file.object_id)) {
        fileMap.set(file.object_id, []);
      }
      fileMap.get(file.object_id)!.push(file);
    }

    return newsList.map(n => {
      const files = fileMap.get(n.id) || [];
      return {
        ...n,
        file_attach: files,
        img: files.length > 0 ? files[0].path : null,
      };
    });
  }

  private async getNewsWithFiles(newsItem: any) {
    if (!newsItem) return newsItem;
    const fileAttaches = await this.prisma.file_attach.findMany({
      where: {
        object_id: newsItem.id,
        nghiepvu_code: 'NEWS',
      }
    });
    return {
      ...newsItem,
      file_attach: fileAttaches,
      img: fileAttaches.length > 0 ? fileAttaches[0].path : null,
    };
  }
}
