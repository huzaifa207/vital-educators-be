import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { PrismaService } from 'src/prisma.service';
import { FlaggedMessagesController } from './flagged-messages.controller';
import { FlaggedMessagesService } from './flagged-messages.service';

@Module({
  imports: [AlertsModule],
  controllers: [FlaggedMessagesController],
  providers: [PrismaService, FlaggedMessagesService],
  exports: [FlaggedMessagesService],
})
export class FlaggedMessagesModule {}
