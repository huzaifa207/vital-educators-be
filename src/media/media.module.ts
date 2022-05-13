import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryModule } from './../cloudinay/cloudinay.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController],
  providers: [MediaService, PrismaService],
})
export class MediaModule {}
