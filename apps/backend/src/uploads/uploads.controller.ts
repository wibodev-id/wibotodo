import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  private get uploadDir(): string {
    return resolve(this.config.get<string>('UPLOAD_DIR', './uploads'));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image (jpeg/png/webp/gif, max 5MB)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, resolve(process.env.UPLOAD_DIR ?? './uploads')),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const name = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
          cb(null, name);
        },
      }),
      limits: {
        fileSize: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5) * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException(`Unsupported mime type: ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Fetch an uploaded image (public)' })
  serve(@Param('filename') filename: string, @Res() res: Response) {
    if (filename.includes('..') || filename.includes('/')) {
      throw new BadRequestException('Invalid filename');
    }
    const filepath = join(this.uploadDir, filename);
    if (!existsSync(filepath)) {
      throw new NotFoundException();
    }
    res.sendFile(filepath);
  }
}
