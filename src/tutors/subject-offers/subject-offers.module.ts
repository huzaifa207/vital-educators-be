import { Module } from '@nestjs/common';
import { SubjectOffersController } from './subject-offers.controller';
import { SubjectOffersService } from './subject-offers.service';

@Module({
  controllers: [SubjectOffersController],
  providers: [SubjectOffersService],
  exports: [SubjectOffersService],
})
export class SubjectOffersModule {}
