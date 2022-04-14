import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { ChatsModule } from './chats/chats.module';
import { CloudinaryModule } from './cloudinay/cloudinay.module';
import { MailModule } from './mail-service/mail.module';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { DocumentsController } from './tutors/documents/documents.controller';
import { QualificationsController } from './tutors/qualifications/qualifications.controller';
import { RefereesController } from './tutors/referees/referees.controller';
import { SubjectOffersController } from './tutors/subject-offers/subject-offers.controller';
import { TutoringDetailsController } from './tutors/tutoring-details/tutoring-details.controller';
import { TutorsController } from './tutors/tutors.controller';
import { TutorsModule } from './tutors/tutors.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TutorsModule,
    MailModule,
    MediaModule,
    ChatsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
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
        { path: 'subject-offer/all', method: RequestMethod.GET },
      )
      .forRoutes(
        UsersController,
        TutorsController,
        RefereesController,
        QualificationsController,
        TutoringDetailsController,
        SubjectOffersController,
        MediaController,
        DocumentsController,
      );
  }
}
