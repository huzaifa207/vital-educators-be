import { Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { FileService } from './file.service';

@Controller('file')
export class FileUploadController {
  constructor(private readonly fileService: FileService, private prisma: PrismaService) {}
  @Post()
  async create(@Req() request: Request, @Res() response: Response) {
    try {
      await this.fileService.fileupload(request, response);
    } catch (error) {
      return response.status(500).json(`Failed to upload image file: ${error.message}`);
    }
  }

  @Get('/:id')
  async get(@Param('id') id: number) {
    return await this.fileService.getMedia(id);
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
