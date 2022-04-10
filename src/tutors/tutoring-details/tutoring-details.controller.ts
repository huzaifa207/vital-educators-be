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
import { TutoringDetailsService } from './tutoring-details.service';

@Controller('tutoring-detail')
export class TutoringDetailsController {
  constructor(
    private readonly tutoringDetailsService: TutoringDetailsService,
  ) {}

  @Post('/create')
  create(
    @Body() createTutoringDetailDto: Prisma.TutoringDetailCreateInput,
    @Req() request: Request,
  ) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.tutoringDetailsService.create(createTutoringDetailDto, +id);
  }

  @Get('/all')
  findAll(@Req() request: Request) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.tutoringDetailsService.findAll(+id);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.tutoringDetailsService.findOne(+id);
  }

  @Patch('/update')
  update(
    @Req() request: Request,
    @Body() updateTutoringDetailDto: Prisma.TutoringDetailUpdateInput,
  ) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.tutoringDetailsService.update(+id, updateTutoringDetailDto);
  }

  @Delete('/delete')
  async remove(@Req() request: Request) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return await this.tutoringDetailsService.remove(+id);
  }
}
