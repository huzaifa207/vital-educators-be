import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, NotFoundException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { PrismaService } from 'src/prisma-module/prisma.service';

const s3Config = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async fileupload(@Req() req: Request, @Res() res: Response) {
    const p = this.prisma;
    try {
      this.upload(req, res, function (error: any) {
        if (error) {
          console.log(error);
          return res.status(404).json(`Failed to upload image file: ${error}`);
        }
        const file = req.files[0];
        new Promise(async function (resolve, reject) {
          await p.media.create({
            data: {
              url: file.location,
              key: file.key,
              type: file.mimeType.split('/')[1],
            },
          });
          resolve(file.location);
        });

        return res.status(201).json({
          url: file.location,
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(`Failed to upload image file: ${error}`);
    }
  }

  public async deleteFile(key: string) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      };
      const data = await s3Config.send(new DeleteObjectCommand(params));
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
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

  upload = multer({
    storage: multerS3({
      s3: s3Config,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      acl: 'public-read',
      key: function (request, file, cb) {
        cb(null, `${Date.now().toString()} - ${file.originalname}`);
      },
    }),
  }).array('file', 1);
}
