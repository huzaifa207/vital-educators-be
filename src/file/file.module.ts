import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma-module/prisma.module';
import { CloudinaryModule } from '../cloudinay/cloudinay.module';
import { FileUploadController } from './file.controller';
import { FileService } from './file.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CloudinaryModule, PrismaModule, UsersModule],
  controllers: [FileUploadController],
  providers: [FileService],
  exports: [FileService],
})
export class MediaModule {}
