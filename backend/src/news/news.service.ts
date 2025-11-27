import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createNewsDto: CreateNewsDto) {
    const slug = this.generateSlug(createNewsDto.title);

    const news = await this.prisma.news.create({
      data: {
        ...createNewsDto,
        slug,
        user_id: userId,
        published_at: createNewsDto.status === 'PUBLISHED' ? new Date() : null,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
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

    const data: any = { ...updateNewsDto };

    if (updateNewsDto.title && updateNewsDto.title !== existingNews.title) {
      data.slug = this.generateSlug(updateNewsDto.title);
    }

    if (updateNewsDto.status === 'PUBLISHED' && existingNews.status === 'DRAFT') {
      data.published_at = new Date();
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
      },
    });
  }

  async remove(id: number) {
    return this.prisma.news.delete({
      where: { id },
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

