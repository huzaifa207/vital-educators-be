import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [PrismaService, AlertsService],
})
export class AlertsModule {}
