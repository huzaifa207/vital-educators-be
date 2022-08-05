import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RefereesModule } from 'src/tutors/referees/referees.module';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [RefereesModule],
  controllers: [AdminController],
  providers: [PrismaService, TutorsService],
})
export class AdminMoudle {}
