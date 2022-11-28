import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { StripeModule } from 'src/stripe/stripe.module';
import { CurrentStudentMiddleware } from './middleware/current-student.middleware';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [StripeModule],
  exports: [StudentsService],
})
export class StudentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentStudentMiddleware)
      .exclude(
        { path: 'students/chat-tutors', method: RequestMethod.GET },
        { path: 'students/payment-record', method: RequestMethod.GET },
        { path: 'students/credit-purchase', method: RequestMethod.POST },
        { path: 'students/stripe-purchase-intent', method: RequestMethod.POST },

        { path: 'students/:id', method: RequestMethod.GET },
      )
      .forRoutes(StudentsController);
  }
}
