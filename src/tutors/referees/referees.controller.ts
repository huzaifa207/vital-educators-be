import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { RefereesService } from './referees.service';

@Controller('referee')
export class RefereesController {
  constructor(private readonly refereesService: RefereesService) {}

  @Post('/create')
  create(
    @Body() createRefereeDto: Prisma.RefereesCreateInput,
    @Req() request: Request,
  ) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;

    return this.refereesService.create(createRefereeDto, +id);
  }

  @Get('/all')
  findAll(@Req() request: Request) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.refereesService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refereesService.findOne(+id);
  }

  @Patch('/update/:id')
  update(
    @Param('id') id: string,
    @Body() updateRefereeDto: Prisma.RefereesUpdateInput,
  ) {
    return this.refereesService.update(+id, updateRefereeDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.refereesService.remove(+id);
  }
}
