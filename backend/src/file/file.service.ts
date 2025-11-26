import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

interface UploadedFileInfo {
  key: string;
  url: string;
}

interface FetchedFile {
  stream: Readable;
  contentType: string;
  contentLength?: number;
}

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    const bucket = this.configService.get<string>('R2_BUCKET');

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('Cloudflare R2 configuration is missing. Please check env variables.');
    }

    this.bucket = bucket;
    this.publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL') || undefined;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private buildPublicUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl}/${key}`;
    }

    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    return `${endpoint}/${this.bucket}/${key}`;
  }

  private resolveBody(file: Express.Multer.File) {
    const body =
      file.buffer && file.buffer.length > 0
        ? file.buffer
        : file.path
        ? createReadStream(file.path)
        : undefined;

    if (!body) {
      throw new Error('Cannot read uploaded file data');
    }

    return body;
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadedFileInfo> {
    const key = `fileservice-${Date.now()}-${file.originalname}`;
    const body = this.resolveBody(file);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
      }),
    );

    const url = this.buildPublicUrl(key);
    return { key, url };
  }

  async uploadFileWithKey(file: Express.Multer.File, key: string): Promise<UploadedFileInfo> {
    const body = this.resolveBody(file);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
      }),
    );

    const url = this.buildPublicUrl(key);
    return { key, url };
  }

  async getFile(key: string): Promise<FetchedFile> {
    const result = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const stream = result.Body as Readable;

    let length: number | undefined;
    if (typeof result.ContentLength === 'number') {
      length = result.ContentLength;
    } else if (typeof (result.ContentLength as any) === 'bigint') {
      length = Number(result.ContentLength as any);
    }

    return {
      stream,
      contentType: result.ContentType || 'application/octet-stream',
      contentLength: length,
    };
  }
}


