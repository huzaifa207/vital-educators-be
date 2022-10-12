import { Module } from '@nestjs/common';
import { CloudinaryModule } from './../cloudinay/cloudinay.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
