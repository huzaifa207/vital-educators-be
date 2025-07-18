import { Controller, Delete, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { FileService } from './file.service';

export type TFileType = 'RESOURCE' | 'DOCUMENT' | 'MEDIA';

@Controller('file')
export class FileUploadController {
  constructor(private readonly fileService: FileService, private prisma: PrismaService) {}

  // ***** Need User Authenticatoin ****
  // ***** User must have logged as ADMIN, TUTOR OR STUDENT ****

  @Post('/:mediaType')
  async create(
    @Param('mediaType') mediaType: TFileType,
    @Req() request: Request,
    @Res() response: Response,
    @Query('key') key: string,
  ) {
    try {
      if (mediaType === 'RESOURCE') {
        if (!key) return response.status(500).json('key was not provided');
        await this.fileService.resourceUpload(request, response, key);
      } else if (mediaType === 'DOCUMENT') {
        if (!key) return response.status(500).json('key was not provided');
        await this.fileService.documentUpload(request, response, key);
      } else {
        await this.fileService.fileUpload(request, response);
      }
    } catch (error) {
      return response.status(500).json(`Failed to upload image file: ${error.message}`);
    }
  }

  @Get('/url')
  async get(@Query('key') key: string) {
    return await this.fileService.getFileUrl(key);
  }

  @Delete(':key')
  async delete(@Req() request: Request, @Res() response: Response) {
    try {
      const key = request.params.key;
      console.log(key);
      const data = await this.fileService.deleteFile(key);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json(`Failed to delete image file: ${error.message}`);
    }
  }
}
