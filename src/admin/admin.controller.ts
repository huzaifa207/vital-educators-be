import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateTutorDto } from 'src/tutors/dto/update-tutor.dto';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminService } from './admin.service';

@Controller('/admin')
export class AdminController {
  constructor(
    private readonly tutorService: TutorsService,
    private readonly refereeService: RefereesService,
    private readonly adminService: AdminService,
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
  @Get('stats')
  async getStats() {
    return await this.adminService.getStats();
  }
  @Patch('tutor-detail/:tutorId')
  update(
    @Body() updateTutorDto: UpdateTutorDto,
    @Param('tutorId', new ParseIntPipe()) tutorId: number,
  ) {
    return this.tutorService.updateTutor(tutorId, updateTutorDto);
  }
}
