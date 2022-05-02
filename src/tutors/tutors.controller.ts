import { Body, Controller, Delete, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
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

  @Get('filter')
  async getFilteredTutor(
    @Query() { subject, postCode, skip }: { subject: string; postCode: number; skip: number },
  ) {
    return await this.tutorsService.filterTutor(subject, postCode, skip);
  }
}
