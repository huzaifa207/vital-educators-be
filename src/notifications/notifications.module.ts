import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  controllers: [NotificationController],
  providers: [PrismaService, NotificationService],
})
export class NotificationModule {}
