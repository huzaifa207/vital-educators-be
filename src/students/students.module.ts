import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CurrentStudentMiddleware } from './middleware/current-student.middleware';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentStudentMiddleware)
      .exclude({ path: 'student/:id', method: RequestMethod.GET })
      .forRoutes(StudentsController);
  }
}
