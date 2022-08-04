import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [PrismaService, TutorsService],
})
export class AdminMoudle {}
