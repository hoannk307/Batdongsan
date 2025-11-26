import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('file')
@Controller('file')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const { key, url } = await this.fileService.uploadFile(file);
    return { key, url };
  }

  @Get('view/:key')
  @ApiOperation({ summary: 'Xem file (inline)' })
  async viewFile(@Param('key') key: string, @Res() res: Response) {
    const file = await this.fileService.getFile(key);

    res.setHeader('Content-Type', file.contentType);
    if (file.contentLength) {
      res.setHeader('Content-Length', file.contentLength.toString());
    }

    file.stream.pipe(res);
  }

  @Get('download/:key')
  @ApiOperation({ summary: 'Tải file (download)' })
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    const file = await this.fileService.getFile(key);

    const filename = key.split('/').pop() ?? key;

    res.setHeader('Content-Type', file.contentType);
    if (file.contentLength) {
      res.setHeader('Content-Length', file.contentLength.toString());
    }
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    file.stream.pipe(res);
  }
}


