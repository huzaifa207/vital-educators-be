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
import { SubjectOffersService } from './subject-offers.service';

@Controller('subject-offer')
export class SubjectOffersController {
  constructor(private readonly subjectOffersService: SubjectOffersService) {}

  @Post()
  create(
    @Body() createSubjectOfferDto: Prisma.SubjectOfferCreateInput,
    @Req() req: Request,
  ) {
    const { id } = req.currentTutor as Prisma.TutorCreateManyInput;
    return this.subjectOffersService.create(createSubjectOfferDto, +id);
  }

  @Get()
  findAll(@Req() request: Request) {
    const { id: tutorId } = request.currentTutor;
    return this.subjectOffersService.findAll(+tutorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectOffersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateSubjectOfferDto: Prisma.SubjectOfferUncheckedUpdateInput,
  ) {
    const { id: tutorId } = req.currentTutor;
    return this.subjectOffersService.update(
      +id,
      +tutorId,
      updateSubjectOfferDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const { id: tutorId } = req.currentTutor;
    return this.subjectOffersService.remove(+id, +tutorId);
  }
}
