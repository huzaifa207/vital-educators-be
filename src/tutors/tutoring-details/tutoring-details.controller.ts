import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TutoringDetailsService } from './tutoring-details.service';
import { CreateTutoringDetailDto } from './dto/create-tutoring-detail.dto';
import { UpdateTutoringDetailDto } from './dto/update-tutoring-detail.dto';

@Controller('tutoring-details')
export class TutoringDetailsController {
  constructor(private readonly tutoringDetailsService: TutoringDetailsService) {}

  @Post()
  create(@Body() createTutoringDetailDto: CreateTutoringDetailDto) {
    return this.tutoringDetailsService.create(createTutoringDetailDto);
  }

  @Get()
  findAll() {
    return this.tutoringDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutoringDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTutoringDetailDto: UpdateTutoringDetailDto) {
    return this.tutoringDetailsService.update(+id, updateTutoringDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tutoringDetailsService.remove(+id);
  }
}
