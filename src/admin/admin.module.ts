import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { QualificationsModule } from 'src/tutors/qualifications/qualifications.module';
import { RefereesModule } from 'src/tutors/referees/referees.module';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { SubjectOffersModule } from 'src/tutors/subject-offers/subject-offers.module';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [RefereesModule, QualificationsModule, SubjectOffersModule],
  controllers: [AdminController],
  providers: [PrismaService, TutorsService, AdminService],
})
export class AdminMoudle {}
