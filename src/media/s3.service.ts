// import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { Injectable, Req, Res } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { PrismaService } from 'src/prisma-module/prisma.service';

// const s3Config = new S3Client({
//   region: 'eu-west-2' || process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: 'AKIA4BKIYFWJUM4RQ4EC' || process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey:
//       '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' || process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// @Injectable()
// export class S3 {
//   constructor(private prisma: PrismaService) {}

//   async fileupload(@Req() req: Request, @Res() res: Response) {
//     const input = {
//       Bucket: 'vitaleducators',
//       Key: '1.jpeg',
//     };

//     const command = new GetObjectCommand(input);
//     const response = await s3Config.send(command);
//   }
// }

// npm install @nestjs/common @nestjs/core multer aws-sdk

/////////////////////////////////////////////

import { Controller, Post, UploadedFile } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Controller('upload')
export class S3Service {
  constructor(private readonly s3: S3) {}

  @Post('file')
  async uploadFile(@UploadedFile() file) {
    const { originalname } = file;
    const bucketS3 = 'vitaleducators';
    return this.s3.upload(
      {
        Bucket: bucketS3,
        Key: String(originalname),
        Body: file.buffer,
      },
      (err, data) => {
        if (err) {
          throw new Error(err);
        }
        console.log('1111');
        console.log(data);
        const fileObject = {
          originalname,
          fileUrl: data.Location,
        };

        // Get an expirable link from S3
        const expirableLink = this.s3.getSignedUrl('getObject', {
          Bucket: bucketS3,
          Key: originalname,
          Expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
        });
        console.log('2222');
        console.log({
          fileObject,
          expirableLink,
        });

        // Return the file object and the expirable link
        return {
          fileObject,
          expirableLink,
        };
      },
    );
  }
}
