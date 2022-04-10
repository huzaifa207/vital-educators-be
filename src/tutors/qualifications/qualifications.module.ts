import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { QualificationsController } from './qualifications.controller';
import { QualificationsService } from './qualifications.service';

@Module({
  controllers: [QualificationsController],
  providers: [PrismaService, QualificationsService],
  exports: [QualificationsService],
})
export class QualificationsModule {}
