import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

function normalizeTagName(tag: string) {
  return String(tag || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeTagNames(tags?: string[]) {
  if (!Array.isArray(tags)) return [];
  return Array.from(new Set(tags.map(normalizeTagName).filter(Boolean)));
}

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

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

    return news;
  }

  async findAll(page = 1, limit = 20, status?: string, category?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
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

    return {
      data: news,
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

    return news;
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

    return news;
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
      return this.prisma.news.findUnique({
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
    }

    return this.prisma.news.update({
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
  }

  async remove(id: number) {
    return this.prisma.news.delete({
      where: { id },
    });
  }

  async findLatest(limit = 6, category?: string) {
    return this.prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category ? { category } : { category: 'NORMAL' }),
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
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
