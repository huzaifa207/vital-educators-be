import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, Req, Res } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { S3 } from 'aws-sdk';
import { Request, Response } from 'express';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { S3Cred } from 'src/settings';
import { UsersService } from 'src/users/users.service';
import { TFileType } from './file.controller';

const s3Config = new S3Client(S3Cred.config);
const s3 = new S3(S3Cred.S3);

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService, private readonly usersService: UsersService) {}

  async unifiedUpload(
    @Req() req: Request,
    @Res() res: Response,
    mediaType: TFileType,
    key: string,
  ) {
    try {
      const folderPath = this.buildFolderPath(mediaType, key);
      return await this.uploadFileToS3(req, res, folderPath);
    } catch (error) {
      console.log(error);
      return res.status(500).json(`Failed to upload ${mediaType.toLowerCase()} file: ${error}`);
    }
  }

  async uploadFileToS3(@Req() req: Request, @Res() res: Response, folderPath: string) {
    return this.upload(folderPath)(req, res, async (error: any) => {
      if (error) {
        console.log(error);
        throw new BadRequestException(`Failed to upload file: ${error.message}`);
      }

      const fileTypes = Object.keys(req?.files);

      for (const type of fileTypes) {
        const file = req?.files?.[type]?.[0];
        if (file) {
          if (type === 'profile_url') {
            await this.updateUserProfile(req, file);
          }

          return res.status(201).json({
            url: file?.location,
            key: file?.key,
          });
        }
      }

      return res.status(400).json('No file uploaded');
    });
  }

  private async updateUserProfile(req: Request, file: any) {
    try {
      const { id, role } = req.currentUser as Prisma.UserCreateManyInput;

      const alertMessage =
        role === 'TUTOR'
          ? 'Tutor updated their profile picture.'
          : 'Student updated their profile picture.';

      await this.usersService.update(+id, { profile_url: file?.location }, alertMessage);
    } catch (error) {
      console.warn('Failed to update user profile:', error);
    }
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
      throw new BadRequestException('Failed to generate signed URL');
    }
  }

  upload(prePath: string) {
    return multer({
      storage: multerS3({
        s3: s3Config,
        bucket: S3Cred.bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (_, file, cb) {
          const fileType = file.mimetype.split('/')[0];
          cb(null, { fileType, fieldName: file.fieldname });
        },
        key: function (_, file, cb) {
          const path = `${prePath}/${file.originalname}`;
          cb(null, path);
        },
      }),
    }).fields([
      { name: 'resource', maxCount: 1 },
      { name: 'file', maxCount: 1 },
      { name: 'profile_url', maxCount: 1 },
      { name: 'passport_url', maxCount: 1 },
      { name: 'license_url', maxCount: 1 },
      { name: 'criminal_record_url', maxCount: 1 },
    ]);
  }

  public async deleteFile(key: string) {
    try {
      const params = {
        Bucket: S3Cred.bucket,
        Key: key,
      };
      const data = await s3Config.send(new DeleteObjectCommand(params));
      return data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  private buildFolderPath(mediaType: TFileType, key: string): string {
    const folderMap = {
      RESOURCE: 'resources',
      DOCUMENT: 'documents',
      MEDIA: 'media',
    };

    return `${folderMap[mediaType]}/${key}`;
  }
}
