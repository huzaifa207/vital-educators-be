import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinay/cloudinay.service';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { ENV } from 'src/settings';

@Injectable()
export class MediaService {
  constructor(private cloudinary: CloudinaryService, private prisma: PrismaService) {}
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

  async uploadMedia(file: Express.Multer.File) {
    const extension = file.filename.split('.')[1];

    let baseUrl = 'https://vital-educator.herokuapp.com';
    if (Number(ENV['PORT']) === 3000) {
      baseUrl = `http://localhost:${ENV['PORT']}`;
    }

    const url = `${baseUrl}/docs/${file.filename}`;
    // const media = await this.prisma.media.create({
    //   data: {
    //     url: url,
    //     type: extension,
    //   },
    // });
    return '1';
  }

  async getMedia(id: number) {
    try {
      const media = await this.prisma.media.findUnique({
        where: { id: +id },
      });
      if (!media) {
        throw new NotFoundException('Media not found');
      }

      return media;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Media not found');
    }
  }
}
