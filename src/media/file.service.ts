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
import { UsersService } from 'src/users/users.service';

const s3Config = new S3Client(S3Cred.config);
const s3 = new S3(S3Cred.S3);

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService, private readonly usersService: UsersService) {}

  async fileUpload(@Req() req: Request, @Res() res: Response) {
    try {
      const { id, role } = req.currentUser as Prisma.UserCreateManyInput;
      const filePathAsKey = `public/media/${role}/${id}`;
      return await this.uploadFileToS3(req, res, filePathAsKey, 'MEDIA');
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
    const acl = mediaType === 'RESOURCE' ? 'private' : 'public-read';
    return this.upload(key, acl)(req, res, async (error: any) => {
      if (error) {
        console.log(error);
        throw new BadRequestException(`Failed to upload file: ${error.message}`);
      }

      const fileTypes = Object.keys(req?.files);
      const { id } = req?.currentUser as Prisma.UserCreateManyInput;
      const documents = {};

      fileTypes.forEach(async (type) => {
        const file = req?.files?.[type]?.[0];
        if (file) {
          if (type === 'resource')
            return res.status(201).json({
              url: file?.location,
              key: file?.key,
            });
          if (type === 'profile_url') {
            try {
              const updateUser = { profile_url: file?.location };
              const { profile_url } = await this.usersService.update(+id, updateUser);
              if (profile_url) return res.status(201).json({ profile_url });
            } catch (er) {
              console.warn(er);
              throw new BadRequestException();
            }
          } else {
            documents[type] = file?.location;
          }
        }
      });
      if (Object.entries(documents).length > 0) return res.status(201).json(documents);
    });
  }

  async getFileUrl(key: string, expires: number = 30 * 60) {
    try {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: S3Cred.bucket,
        Key: key,
        Expires: expires,
      });
      return url;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  upload(prePath: string, acl: string = 'private') {
    return multer({
      storage: multerS3({
        s3: s3Config,
        bucket: S3Cred.bucket,
        acl,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (_, file, cb) {
          const fileType = file.mimetype.split('/')[0];
          cb(null, { fileType, fieldName: file.fieldname });
        },
        key: function (_, file, cb) {
          let path = '';
          if (file.fieldname === 'resource') path = `${prePath}/${file.originalname}`;
          else path = `${prePath}/${file.fieldname}/${file.originalname}`;
          cb(null, path);
        },
      }),
    }).fields([
      { name: 'resource', maxCount: 1 },
      { name: 'profile_url', maxCount: 1 },
      { name: 'passport_url', maxCount: 1 },
      { name: 'license_url', maxCount: 1 },
      { name: 'criminal_record_url', maxCount: 1 },
    ]);
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
