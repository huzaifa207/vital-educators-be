import { Module } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { TaskSchadularsModule } from 'src/task-schadulars/task-schadulars.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [TaskSchadularsModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, MailService],
})
export class FeedbackModule {}
