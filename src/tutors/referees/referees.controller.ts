import {
  Body,
  Controller,
  Delete,
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
  create(
    @Body() createRefereeDto: Prisma.RefereesCreateInput,
    @Req() request: Request,
  ) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;

    return this.refereesService.create(createRefereeDto, +id);
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
    @Body() updateRefereeDto: Prisma.RefereesUpdateInput,
  ) {
    return this.refereesService.update(+id, updateRefereeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.refereesService.remove(+id);
  }
}
