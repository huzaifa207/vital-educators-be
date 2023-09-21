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
