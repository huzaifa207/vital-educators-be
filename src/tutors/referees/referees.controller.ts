import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { RefereesService } from './referees.service';

@Controller('referee')
export class RefereesController {
  constructor(private readonly refereesService: RefereesService) {}

  @Post()
  create(@Body() createRefereeDto: Prisma.RefereesCreateInput, @Req() request: Request) {
    const user = request.currentUser;
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;

    if (createRefereeDto.email === user.email) {
      throw new ForbiddenException('You cannot add yourself as a referee');
    }
    return this.refereesService.create(createRefereeDto, +id, user);
  }

  @Get()
  findAll(@Req() request: Request) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.refereesService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refereesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() updateRefereeDto: Prisma.RefereesUpdateInput,
  ) {
    const { id: tutorId } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.refereesService.update(+id, tutorId, updateRefereeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const { id: tutorId } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.refereesService.remove(+id, +tutorId);
  }
}
