import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from 'src/mail-service/mail.module';
import { PrismaService } from 'src/prisma.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { TaskSchadularsService } from './task-schadulars.service';

@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot(), MailModule],
  controllers: [],
  providers: [TaskSchadularsService, PrismaService, TutorsService],
  exports: [TaskSchadularsService],
})
export class TaskSchadularsModule {}
