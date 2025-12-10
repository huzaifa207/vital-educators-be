import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from 'src/mail-service/mail.module';
import { MailService } from 'src/mail-service/mail.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { TutorsModule } from 'src/tutors/tutors.module';
import { TaskSchadularsService } from './task-schadulars.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    TutorsModule,
    StripeModule,
    MailModule,
  ],
  controllers: [],
  providers: [TaskSchadularsService],
  exports: [TaskSchadularsService],
})
export class TaskSchadularsModule {}
