import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { TutorGuard } from 'src/guards/tutor.guar';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { TutorsService } from './tutors.service';

@Controller('tutor')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @UseGuards(TutorGuard)
  @Post()
  create(
    @Body() createTutorDto: Prisma.TutorCreateInput,
    @Req() request: Request,
  ) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;

    return this.tutorsService.create(createTutorDto, +id);
  }

  @Get()
  findOne(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.tutorsService.findOne(+id);
  }

  @UseGuards(TutorGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorsService.update(+id, updateTutorDto);
  }

  @UseGuards(TutorGuard)
  @Delete()
  remove(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.tutorsService.deActivateTutor(+id);
  }
}
