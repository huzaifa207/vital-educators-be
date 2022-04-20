import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail-service/mail.module';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { PrismaService } from './../prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MailModule,
    TokenModule,
  ],
  controllers: [UsersController],
  providers: [
    TutorsService,
    UsersService,
    PrismaService,
    TokenService,
    DocumentsService,
    TutoringDetailsService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
