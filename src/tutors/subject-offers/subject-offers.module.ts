import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SubjectOffersController } from './subject-offers.controller';
import { SubjectOffersService } from './subject-offers.service';

@Module({
  controllers: [SubjectOffersController],
  providers: [PrismaService, SubjectOffersService],
  exports: [SubjectOffersService],
})
export class SubjectOffersModule {}
