import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinay/cloudinay.service';

@Injectable()
export class MediaService {
  constructor(private cloudinary: CloudinaryService) {}
  async uploadImageToCloudinary(file: Express.Multer.File) {
    return await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
  }

  async uploadFileToCloudinary(file: Express.Multer.File) {
    return await this.cloudinary.uploadFile(file).catch((err) => {
      console.log('error - ', err);
      throw new BadRequestException('Invalid file type.', err);
    });
  }
}
