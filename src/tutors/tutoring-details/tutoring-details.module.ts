import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TutoringDetailsController } from './tutoring-details.controller';
import { TutoringDetailsService } from './tutoring-details.service';

@Module({
  controllers: [TutoringDetailsController],
  providers: [PrismaService, TutoringDetailsService],
  exports: [TutoringDetailsService],
})
export class TutoringDetailsModule {}
