import { Module } from '@nestjs/common';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, AlertsService, MailService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
