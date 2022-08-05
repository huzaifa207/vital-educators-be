import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { TutorsService } from 'src/tutors/tutors.service';

@Controller('/admin')
export class AdminController {
  constructor(
    private readonly tutorService: TutorsService,
    private readonly refereeService: RefereesService,
  ) {}
  @Get('tutor/:tutorId')
  async getTutorById(@Param('tutorId', new ParseIntPipe()) tutorId: number) {
    const tutorDetails = await this.tutorService.getTutorProfile(tutorId, {
      userExcludedFields: ['password', 'password_reset_token'],
    });

    return {
      ...tutorDetails,
      referees: await this.refereeService.findAll(tutorId),
    };
  }
}
