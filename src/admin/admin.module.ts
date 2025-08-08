import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { PrismaModule } from 'src/prisma-module/prisma.module';
import { StudentsModule } from 'src/students/students.module';
import { QualificationsModule } from 'src/tutors/qualifications/qualifications.module';
import { RefereesModule } from 'src/tutors/referees/referees.module';
import { SubjectOffersModule } from 'src/tutors/subject-offers/subject-offers.module';
import { TutorsModule } from 'src/tutors/tutors.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MailModule } from 'src/mail-service/mail.module';
import { UsersModule } from 'src/users/users.module';
import { DocumentsModule } from 'src/tutors/documents/documents.module';

@Module({
  imports: [
    PrismaModule,
    RefereesModule,
    QualificationsModule,
    SubjectOffersModule,
    TutorsModule,
    StudentsModule,
    AlertsModule,
    MailModule,
    UsersModule,
    DocumentsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminMoudle {}
