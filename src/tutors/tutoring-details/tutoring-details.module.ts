import { Module } from '@nestjs/common';
import { TutoringDetailsService } from './tutoring-details.service';
import { TutoringDetailsController } from './tutoring-details.controller';

@Module({
  controllers: [TutoringDetailsController],
  providers: [TutoringDetailsService]
})
export class TutoringDetailsModule {}
