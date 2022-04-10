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
import { QualificationsService } from './qualifications.service';

@Controller('qualification')
export class QualificationsController {
  constructor(private readonly qualificationsService: QualificationsService) {}

  @Post('/create')
  create(
    @Body() createQualificationDto: Prisma.QualificationCreateInput,
    @Req() request: Request,
  ) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.qualificationsService.create(createQualificationDto, +id);
  }

  @Get('/all')
  findAll(@Req() request: Request) {
    const { id } = request.currentTutor as Prisma.TutorCreateManyInput;
    return this.qualificationsService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qualificationsService.findOne(+id);
  }

  @Patch('/update/:id')
  update(
    @Param('id') id: string,
    @Body() updateQualificationDto: Prisma.QualificationUpdateInput,
  ) {
    return this.qualificationsService.update(+id, updateQualificationDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.qualificationsService.remove(+id);
  }
}
