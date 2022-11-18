import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MailModule } from 'src/mail-service/mail.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { StripeService } from 'src/stripe/stripe.service';
import { DocumentsController } from './documents/documents.controller';
import { DocumentsModule } from './documents/documents.module';
import { CurrentTutorMiddleware } from './middleware/current-tutor.middleware';
import { QualificationsController } from './qualifications/qualifications.controller';
import { QualificationsModule } from './qualifications/qualifications.module';
import { RefereesController } from './referees/referees.controller';
import { RefereesModule } from './referees/referees.module';
import { SubjectOffersController } from './subject-offers/subject-offers.controller';
import { SubjectOffersModule } from './subject-offers/subject-offers.module';
import { TutoringDetailsController } from './tutoring-details/tutoring-details.controller';
import { TutoringDetailsModule } from './tutoring-details/tutoring-details.module';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';

@Module({
  imports: [
    RefereesModule,
    QualificationsModule,
    TutoringDetailsModule,
    SubjectOffersModule,
    DocumentsModule,
    StripeModule,
    MailModule,
  ],
  controllers: [
    TutorsController,
    RefereesController,
    QualificationsController,
    TutoringDetailsController,
    SubjectOffersController,
    DocumentsController,
  ],
  providers: [TutorsService, StripeService],
  exports: [TutorsService],
})
export class TutorsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentTutorMiddleware)
      .exclude({ path: 'tutoring-detail/:id', method: RequestMethod.GET })
      .exclude({ path: 'referee/review/:token', method: RequestMethod.POST })
      .forRoutes(
        RefereesController,
        QualificationsController,
        TutoringDetailsController,
        SubjectOffersController,
        DocumentsController,
      );
  }
}
