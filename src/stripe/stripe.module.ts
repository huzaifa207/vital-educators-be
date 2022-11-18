import { Module } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaModule } from 'src/prisma-module/prisma.module';

import { StripeService } from './stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [StripeService, MailService],
  exports: [StripeService],
})
export class StripeModule {}
