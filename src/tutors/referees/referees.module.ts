import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RefereesController } from './referees.controller';
import { RefereesService } from './referees.service';

@Module({
  controllers: [RefereesController],
  providers: [PrismaService, RefereesService],
  exports: [RefereesService],
})
export class RefereesModule {}
