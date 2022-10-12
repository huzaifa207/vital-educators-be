import { Module } from '@nestjs/common';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaModule } from 'src/prisma-module/prisma.module';

import { TaskSchadularsModule } from 'src/task-schadulars/task-schadulars.module';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, MailService],
})
export class NotificationModule {}
