import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, NotFoundException, Req, Res } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { S3 } from 'aws-sdk';
import { Request, Response } from 'express';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { S3Cred } from 'src/settings';
import { TFileType } from './file.controller';

const s3Config = new S3Client(S3Cred.config);
const s3 = new S3(S3Cred.S3);

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async fileUpload(@Req() req: Request, @Res() res: Response, mediaType: TFileType) {
    try {
      const { id, role, first_name } = req.currentUser as Prisma.UserCreateManyInput;
      const filePathAsKey = `${role}/${id}_${first_name}`;
      return await this.uploadFileToS3(req, res, filePathAsKey, mediaType);
    } catch (error) {
      console.log(error);
      return res.status(500).json(`Failed to upload image file: ${error}`);
    }
  }

  async resourceUpload(@Req() req: Request, @Res() res: Response, key: string) {
    try {
      return await this.uploadFileToS3(req, res, `resources/${key}`, 'RESOURCE');
    } catch (error) {
      console.log(error);
      return res.status(500).json(`Failed to upload image file: ${error}`);
    }
  }
  async uploadFileToS3(
    @Req() req: Request,
    @Res() res: Response,
    key: string,
    mediaType: TFileType,
  ) {
    return this.upload(key)(req, res, async (error: any) => {
      if (error) {
        console.log(error);
        throw new BadRequestException(`Failed to upload file: ${error.message}`);
      }

      try {
        const file = req.files[0];

        await this.prisma.media.create({
          data: {
            key: file.key,
            fileType: mediaType,
          },
        });

        return res.status(201).json({
          url: file.location,
          key: file.key,
        });
      } catch (error) {
        console.log(error);
        return error;
      }
    });
  }

  async getFileUrl(key: string) {
    try {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: S3Cred.bucket,
        Key: key,
        Expires: 30 * 60,
      });
      return url;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  upload(prePath: string) {
    return multer({
      storage: multerS3({
        s3: s3Config,
        bucket: S3Cred.bucket,
        acl: 'private',
        metadata: function (_, file, cb) {
          const fileType = file.mimetype.split('/')[0];
          cb(null, { fileType, fieldName: file.fieldname });
        },
        key: function (_, file, cb) {
          cb(null, `${prePath}/${Date.now()}-${file.originalname}`);
        },
      }),
    }).array('file', 1);
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
}
