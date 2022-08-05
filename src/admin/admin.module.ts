import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RefereesModule } from 'src/tutors/referees/referees.module';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [RefereesModule],
  controllers: [AdminController],
  providers: [PrismaService, TutorsService, AdminService],
})
export class AdminMoudle {}
