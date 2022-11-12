import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('/')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (req, file, cb) => {
          const filename: string = nanoid(10);
          const extension: string = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
            file.originalname.length,
          );
          cb(null, `${filename}.${extension}`);
        },
      }),
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File): Promise<{
    id: number;
  }> {
    const id = await this.mediaService.uploadMedia(file);
    return { id: 12 };
  }

  @Post('/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (req, file, cb) => {
          const filename: string = nanoid(10);

          const extension: string = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
            file.originalname.length,
          );
          cb(null, `${filename}.${extension}`);
        },
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{
    imagePath: string;
  }> {
    return { imagePath: `${file.filename}` };
  }

  @Get('/:id')
  async getMeida(@Param('id') id: number) {
    return await this.mediaService.getMedia(id);
  }

  @Post('/docs')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/document',
        filename: (req, file, cb) => {
          const filename: string = file.originalname.split('.')[0] + nanoid(4);
          const extension: string = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
            file.originalname.length,
          );
          cb(null, `${filename}.${extension}`);
        },
      }),
    }),
  )
  uploadDocs(@UploadedFile() file: Express.Multer.File): {
    documentPath: string;
  } {
    return { documentPath: file.filename };
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImageCDN(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.uploadImageToCloudinary(file);
  }

  @Post('/upload-file')
  // @Header('Content-Type', 'application/pdf')
  @UseInterceptors(FileInterceptor('file'))
  uploadFileCDN(@UploadedFile() file: Express.Multer.File) {
    console.log('file imported');
    return this.mediaService.uploadFileToCloudinary(file);
  }
}
