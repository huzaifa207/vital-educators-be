import { DefaultValuePipe } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { AdminGuard } from 'src/guards/admin.guard';
import { TutorGuard } from 'src/guards/tutor.guard';
import { DeleteKeys } from 'src/utils/helpers';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { TutorsService } from './tutors.service';

@Controller('tutor')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @UseGuards(AdminGuard)
  @Get('pending')
  async pendingTutors(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) offset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) limit?: number,
  ) {
    let tutors = await this.tutorsService.pendingTutors({
      offset,
      limit,
    });
    tutors = tutors.map((t) => {
      return {
        ...t,
        user: DeleteKeys(t.user, ['password', 'password_reset_token', 'email_token']),
      };
    }) as typeof tutors;
    return {
      length: tutors.length,
      offset,
      limit,
      tutors,
    };
  }

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
