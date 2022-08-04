import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { TutorGuard } from 'src/guards/tutor.guard';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { TutorsService } from './tutors.service';

@Controller('tutor')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get()
  findOneTutor(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;

    return this.tutorsService.findOneTutor(+id);
  }

  @UseGuards(TutorGuard)
  @Patch()
  update(@Body() updateTutorDto: UpdateTutorDto, @Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.tutorsService.updateTutor(+id, updateTutorDto);
  }

  @UseGuards(TutorGuard)
  @Delete()
  deActivateTutor(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.tutorsService.deActivateTutor(+id);
  }

  @Get('profile/:id')
  async getTutorProfile(@Param() { id }: { id: string }) {
    return await this.tutorsService.getTutorProfile(parseInt(id), {
      userIncludedFields: ['id', 'first_name', 'last_name', 'profile_url', 'postal_code'],
    });
  }

  @Get('filter')
  async getFilteredTutor(
    @Query()
    {
      subject,
      postCode,
      graduationLevel,
      skip,
    }: {
      subject: string;
      postCode: number;
      graduationLevel: string;
      skip: number;
    },
  ) {
    return await this.tutorsService.filterTutor(subject, postCode, graduationLevel, skip);
  }
}
