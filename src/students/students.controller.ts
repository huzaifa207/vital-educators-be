import { Body, Controller, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  createStudentProfile(@Req() req: Request, @Body() profile: string) {
    return this.studentsService.createStudentProfile(
      (req.currentUser as Prisma.UserCreateManyInput).id,
      profile,
    );
  }
}
