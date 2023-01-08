import { Module } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, MailService],
})
export class FeedbackModule {}
