import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { MailModule } from 'src/mail-service/mail.module';
import { MailService } from 'src/mail-service/mail.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { CurrentStudentMiddleware } from './middleware/current-student.middleware';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [StripeModule, AlertsModule, MailModule],
  exports: [StudentsService],
})
export class StudentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentStudentMiddleware)
      .exclude(
        { path: 'students/chat-tutors', method: RequestMethod.GET },
        { path: 'students/payment-record', method: RequestMethod.GET },
        { path: 'students/purchase-record', method: RequestMethod.GET },
        { path: 'students/credit-purchase', method: RequestMethod.POST },
        { path: 'students/stripe-purchase-intent', method: RequestMethod.POST },
        { path: 'students/file-dispute', method: RequestMethod.POST },
        { path: 'students/disputes', method: RequestMethod.GET },
        { path: 'students/:id', method: RequestMethod.GET },
      )
      .forRoutes(StudentsController);
  }
}
