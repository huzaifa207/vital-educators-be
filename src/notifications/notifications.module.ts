import { Module } from '@nestjs/common';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaService } from 'src/prisma.service';
import { TaskSchadularsModule } from 'src/task-schadulars/task-schadulars.module';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  imports: [UsersModule],
  controllers: [NotificationController],
  providers: [PrismaService, NotificationService, MailService],
})
export class NotificationModule {}
