import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma-module/prisma.module';
import { QualificationsModule } from 'src/tutors/qualifications/qualifications.module';
import { RefereesModule } from 'src/tutors/referees/referees.module';
import { SubjectOffersModule } from 'src/tutors/subject-offers/subject-offers.module';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, RefereesModule, QualificationsModule, SubjectOffersModule],
  controllers: [AdminController],
  providers: [TutorsService, AdminService],
})
export class AdminMoudle {}
