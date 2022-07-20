import { HttpException, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RavenInterceptor } from 'nest-raven';
import { join } from 'path';
import { ENV } from 'src/settings';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatsModule } from './chats/chats.module';
import { CloudinaryModule } from './cloudinay/cloudinay.module';
import { MailModule } from './mail-service/mail.module';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { PrismaService } from './prisma.service';
import { StudentsModule } from './students/students.module';
import { TaskSchadularsModule } from './task-schadulars/task-schadulars.module';
import { TaskSchadularsService } from './task-schadulars/task-schadulars.service';
import { TokenModule } from './token/token.module';
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
      secret: ENV.JWT_SECRET,
    }),
    EventEmitterModule.forRoot(),
    TutorsModule,
    MailModule,
    MediaModule,
    ChatsModule,
    CloudinaryModule,
    TokenModule,
    TaskSchadularsModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TaskSchadularsService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        filters: [
          // Filter exceptions of type HttpException. Ignore those that
          // have status code of less than 500
          {
            type: HttpException,
            filter: (exception: HttpException) => 500 >= exception.getStatus(),
          },
        ],
      }),
    },
  ],
})
export class AppModule {
  configure(consumner: MiddlewareConsumer) {
    consumner
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user', method: RequestMethod.POST },
        { path: 'user/:id', method: RequestMethod.GET },
        { path: 'user/forgot-password', method: RequestMethod.POST },
        { path: 'user/all', method: RequestMethod.DELETE },
        { path: 'user/all', method: RequestMethod.GET },
        { path: 'user/send', method: RequestMethod.POST },
        { path: 'user/reset-password', method: RequestMethod.POST },
        { path: 'tutor/profile/:id', method: RequestMethod.GET },
        { path: 'tutor/filter', method: RequestMethod.GET },
        { path: 'tutoring-detail/:id', method: RequestMethod.GET },
        { path: 'user/confirm-email/:token', method: RequestMethod.GET },
        { path: 'subject-offer/all', method: RequestMethod.GET },
        { path: 'referee/review/:token', method: RequestMethod.POST },
        { path: '/', method: RequestMethod.POST },
        { path: 'media', method: RequestMethod.POST },
        { path: 'media/:id', method: RequestMethod.GET },
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
