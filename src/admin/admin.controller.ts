import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TutorsService } from 'src/tutors/tutors.service';

@Controller('/admin')
export class AdminController {
  constructor(private readonly tutorService: TutorsService) {}
  @Get('tutor/:tutorId')
  getTutorById(@Param('tutorId', new ParseIntPipe()) tutorId: number) {
    return this.tutorService.getTutorProfile(tutorId, {
      userExcludedFields: ['password', 'password_reset_token'],
    });
  }
}
