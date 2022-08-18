import { Module } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  controllers: [NotificationController],
  providers: [PrismaService, NotificationService, MailService, UsersService],
})
export class NotificationModule {}
