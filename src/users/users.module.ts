import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailModule } from 'src/mail-service/mail.module';
import { PrismaService } from 'src/prisma.service';
import { ENV } from 'src/settings';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
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
  ],
  controllers: [UsersController],
  providers: [
    AlertsService,
    TutorsService,
    UsersService,
    PrismaService,
    TokenService,
    DocumentsService,
    TutoringDetailsService,
    TaskSchadularsService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
