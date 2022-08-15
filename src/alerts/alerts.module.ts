import { Module } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaService } from 'src/prisma.service';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [PrismaService, AlertsService, MailService],
  exports: [AlertsService],
})
export class AlertsModule {}
