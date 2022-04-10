import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';

@Module({
  controllers: [TutorsController],
  providers: [PrismaService, TutorsService],
})
export class TutorsModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(CurrentTutorMiddleware).forRoutes();
  }
}
