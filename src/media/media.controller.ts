import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';

@Controller('media')
export class MediaController {
  @Post('/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
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
  uploadImage(@UploadedFile() file: Express.Multer.File): {
    imagePath: string;
  } {
    return { imagePath: file.filename };
  }
}
