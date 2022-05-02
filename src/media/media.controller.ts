import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const filename: string = nanoid(10);
          const extension: string = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
            file.originalname.length,
          );
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File): {
    imagePath: string;
  } {
    return { imagePath: file.filename };
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
          cb(null, `${filename}${extension}`);
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
