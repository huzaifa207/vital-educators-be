import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CurrentTutorMiddleware } from './middleware/current-tutor.middleware';
import { QualificationsController } from './qualifications/qualifications.controller';
import { QualificationsModule } from './qualifications/qualifications.module';
import { RefereesController } from './referees/referees.controller';
import { RefereesModule } from './referees/referees.module';
import { TutoringDetailsController } from './tutoring-details/tutoring-details.controller';
import { TutoringDetailsModule } from './tutoring-details/tutoring-details.module';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';

@Module({
  imports: [RefereesModule, QualificationsModule, TutoringDetailsModule],
  controllers: [
    TutorsController,
    RefereesController,
    QualificationsController,
    TutoringDetailsController,
  ],
  providers: [PrismaService, TutorsService],
})
export class TutorsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentTutorMiddleware)
      .exclude({ path: 'tutoring-detail/:id', method: RequestMethod.GET })
      .forRoutes(
        RefereesController,
        QualificationsController,
        TutoringDetailsController,
      );
  }
}
