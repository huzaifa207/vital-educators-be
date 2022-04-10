import { Injectable } from '@nestjs/common';
import { CreateTutoringDetailDto } from './dto/create-tutoring-detail.dto';
import { UpdateTutoringDetailDto } from './dto/update-tutoring-detail.dto';

@Injectable()
export class TutoringDetailsService {
  create(createTutoringDetailDto: CreateTutoringDetailDto) {
    return 'This action adds a new tutoringDetail';
  }

  findAll() {
    return `This action returns all tutoringDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tutoringDetail`;
  }

  update(id: number, updateTutoringDetailDto: UpdateTutoringDetailDto) {
    return `This action updates a #${id} tutoringDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} tutoringDetail`;
  }
}
