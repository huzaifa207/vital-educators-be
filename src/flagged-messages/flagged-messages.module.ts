import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { FlaggedMessagesController } from './flagged-messages.controller';
import { FlaggedMessagesService } from './flagged-messages.service';

@Module({
  imports: [AlertsModule],
  controllers: [FlaggedMessagesController],
  providers: [FlaggedMessagesService],
  exports: [FlaggedMessagesService],
})
export class FlaggedMessagesModule {}
