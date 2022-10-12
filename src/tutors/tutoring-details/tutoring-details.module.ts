import { Module } from '@nestjs/common';
import { TutoringDetailsController } from './tutoring-details.controller';
import { TutoringDetailsService } from './tutoring-details.service';

@Module({
  controllers: [TutoringDetailsController],
  providers: [TutoringDetailsService],
  exports: [TutoringDetailsService],
})
export class TutoringDetailsModule {}
