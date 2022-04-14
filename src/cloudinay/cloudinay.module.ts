import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinay.provider';
import { CloudinaryService } from './cloudinay.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
