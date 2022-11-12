import { Module } from '@nestjs/common';
import { CloudinaryModule } from './../cloudinay/cloudinay.module';
import { FileUploadController } from './file.controller';
import { FileService } from './file.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController, FileUploadController],
  providers: [MediaService, FileService],
})
export class MediaModule {}
