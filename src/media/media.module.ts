import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma-module/prisma.module';
import { CloudinaryModule } from './../cloudinay/cloudinay.module';
import { FileUploadController } from './file.controller';
import { FileService } from './file.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [CloudinaryModule, PrismaModule],
  controllers: [MediaController, FileUploadController],
  providers: [MediaService, FileService],
  exports: [FileService],
})
export class MediaModule {}
