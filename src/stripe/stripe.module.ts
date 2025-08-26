import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { MailModule } from 'src/mail-service/mail.module';
import { PrismaModule } from 'src/prisma-module/prisma.module';
import { TutorsService } from 'src/tutors/tutors.service';
import { StripeController } from './stripe.controller';

import { StripeService } from './stripe.service';

@Module({
  imports: [PrismaModule, AlertsModule, MailModule],
  controllers: [StripeController],
  providers: [StripeService, TutorsService],
  exports: [StripeService],
})
export class StripeModule {}
