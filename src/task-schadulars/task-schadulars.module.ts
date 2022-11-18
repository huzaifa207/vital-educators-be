import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from 'src/mail-service/mail.service';
import { TutorsModule } from 'src/tutors/tutors.module';
import { TutorsService } from 'src/tutors/tutors.service';
import { TaskSchadularsService } from './task-schadulars.service';

@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot(), TutorsModule],
  controllers: [],
  providers: [TaskSchadularsService, MailService, TutorsService],
  exports: [TaskSchadularsService],
})
export class TaskSchadularsModule {}
