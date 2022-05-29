import { Controller, Get, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // @Post()
  // createStudentProfile(@Req() req: Request, @Body() profile: string) {
  //   return this.studentsService.createStudentProfile(
  //     (req.currentUser as Prisma.UserCreateManyInput).id,
  //     profile,
  //   );
  // }

  @Get()
  findByUserId(@Req() req: Request) {
    return this.studentsService.findByUserId((req.currentUser as Prisma.UserCreateManyInput).id);
  }
}
