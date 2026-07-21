import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import type { UploadedBinaryFile } from './interfaces/uploaded-binary-file.interface';
import type { S3UploadResult } from './interfaces/s3-upload-result.interface';
import type { S3FileSummary } from './interfaces/s3-file-summary.interface';
import type { S3FileContent } from './interfaces/s3-file-content.interface';

interface S3LikeError {
  name?: string;
  Code?: string;
  message?: string;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.getRequiredEnv('AWS_REGION');
    const endpoint = this.configService.get<string>('AWS_ENDPOINT')?.trim();
    const accessKeyId = this.getRequiredEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.getRequiredEnv('AWS_SECRET_ACCESS_KEY');

    this.bucket = this.getRequiredEnv('AWS_S3_BUCKET');
    this.client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: UploadedBinaryFile,
    requestedKey?: string,
  ): Promise<S3UploadResult> {
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException('Debes adjuntar un archivo válido');
    }

    const key = this.buildObjectKey(file.originalname, requestedKey);
    const response = await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
      }),
    );

    return {
      bucket: this.bucket,
      key,
      contentType: file.mimetype || 'application/octet-stream',
      size: file.size,
      etag: response.ETag,
    };
  }

  async listFiles(): Promise<S3FileSummary[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
      }),
    );

    return (response.Contents ?? []).flatMap((item) => {
      if (!item.Key) {
        return [];
      }

      return [
        {
          key: item.Key,
          size: item.Size ?? 0,
          lastModified: item.LastModified?.toISOString(),
          etag: item.ETag,
        },
      ];
    });
  }

  async getFile(key: string): Promise<S3FileContent> {
    const normalizedKey = this.normalizeRequestedKey(key);

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: normalizedKey,
        }),
      );

      return {
        key: normalizedKey,
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: Number(response.ContentLength ?? 0),
        lastModified: response.LastModified?.toISOString(),
        etag: response.ETag,
        body: await this.toBuffer(response.Body),
      };
    } catch (error: unknown) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException(
          `No existe un archivo con la clave ${normalizedKey}`,
        );
      }

      throw this.wrapUnexpectedError(error, 'No se pudo obtener el archivo');
    }
  }

  async deleteFile(key: string): Promise<{ deleted: true; key: string }> {
    const normalizedKey = this.normalizeRequestedKey(key);

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: normalizedKey,
        }),
      );
    } catch (error: unknown) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException(
          `No existe un archivo con la clave ${normalizedKey}`,
        );
      }

      throw this.wrapUnexpectedError(error, 'No se pudo validar el archivo');
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: normalizedKey,
      }),
    );

    return { deleted: true, key: normalizedKey };
  }

  private getRequiredEnv(name: string): string {
    const value = this.configService.get<string>(name)?.trim();

    if (!value) {
      throw new InternalServerErrorException(
        `Falta configurar la variable de entorno ${name}`,
      );
    }

    return value;
  }

  private buildObjectKey(originalname: string, requestedKey?: string): string {
    const preferredKey = requestedKey?.trim();
    const baseName = preferredKey || originalname;
    const sanitizedName = this.normalizeRequestedKey(baseName);

    if (preferredKey) {
      return sanitizedName;
    }

    return `${Date.now()}-${sanitizedName}`;
  }

  private normalizeRequestedKey(key: string): string {
    const trimmedKey = key.trim();

    if (!trimmedKey) {
      throw new BadRequestException('La clave del archivo es obligatoria');
    }

    return trimmedKey
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async toBuffer(
    body: GetObjectCommandOutput['Body'],
  ): Promise<Buffer> {
    if (!body) {
      return Buffer.alloc(0);
    }

    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const s3Error = error as S3LikeError;
    return [s3Error.name, s3Error.Code].some(
      (value) =>
        value === 'NoSuchKey' ||
        value === 'NotFound' ||
        value === 'NoSuchBucket' ||
        value === 'NotFoundException',
    );
  }

  private wrapUnexpectedError(
    error: unknown,
    message: string,
  ): InternalServerErrorException {
    const detail = error instanceof Error ? error.message : 'Error desconocido';
    return new InternalServerErrorException(`${message}: ${detail}`);
  }
}
