import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail-service/mail.module';
import { DocumentsService } from 'src/tutors/documents/documents.service';
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
  ],
  controllers: [UsersController],
  providers: [TutorsService, UsersService, PrismaService, DocumentsService],
  exports: [UsersService],
})
export class UsersModule {}
