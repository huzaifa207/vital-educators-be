import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { MailModule } from './mail-service/mail.module';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { QualificationsController } from './tutors/qualifications/qualifications.controller';
import { RefereesController } from './tutors/referees/referees.controller';
import { TutoringDetailsController } from './tutors/tutoring-details/tutoring-details.controller';
import { TutorsController } from './tutors/tutors.controller';
import { TutorsModule } from './tutors/tutors.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TutorsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumner: MiddlewareConsumer) {
    consumner
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/create', method: RequestMethod.POST },
        { path: 'tutoring-detail/:id', method: RequestMethod.GET },
        { path: 'user/confirm-email/:token', method: RequestMethod.GET },
      )
      .forRoutes(
        UsersController,
        TutorsController,
        RefereesController,
        QualificationsController,
        TutoringDetailsController,
      );
  }
}
