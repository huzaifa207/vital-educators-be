import { Module } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaModule } from 'src/prisma-module/prisma.module';
import { TutorsModule } from 'src/tutors/tutors.module';
import { TutorsService } from 'src/tutors/tutors.service';
import { StripeController } from './stripe.controller';

import { StripeService } from './stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [StripeController],
  providers: [StripeService, MailService, TutorsService],
  exports: [StripeService],
})
export class StripeModule {}
