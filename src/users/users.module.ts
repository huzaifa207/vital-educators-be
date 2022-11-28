import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailModule } from 'src/mail-service/mail.module';
import { ENV } from 'src/settings';
import { StripeModule } from 'src/stripe/stripe.module';
import { StripeService } from 'src/stripe/stripe.service';
import { StudentsModule } from 'src/students/students.module';
import { TaskSchadularsModule } from 'src/task-schadulars/task-schadulars.module';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
import { TutorsModule } from 'src/tutors/tutors.module';
import { TutorsService } from 'src/tutors/tutors.service';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    JwtModule.register({
      secret: ENV['JWT_SECRET'],
    }),
    MailModule,
    TokenModule,
    TutorsModule,
    TaskSchadularsModule,
    StudentsModule,
  ],
  controllers: [UsersController],
  providers: [
    AlertsService,
    TutorsService,
    UsersService,
    TokenService,
    DocumentsService,
    TutoringDetailsService,
    StripeService,

    // TaskSchadularsService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
