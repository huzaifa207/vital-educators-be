import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Exception } from 'handlebars';
import { PrismaService } from './../prisma.service';

@Injectable()
export class TutorsService {
  constructor(private prisma: PrismaService) {}

  // create(createTutorDto: Prisma.TutorCreateInput, userId: number) {
  //   try {
  //     return this.prisma.tutor.create({
  //       data: {
  //         ...createTutorDto,
  //         user: { connect: { id: userId } },
  //       },
  //     });
  //   } catch (error) {
  //     throw new BadGatewayException('Tutor already exists');
  //   }
  // }

  async deActivateTutor(userId: number) {
    const tutor = await this.findOne(userId);
    tutor.deActivate = true;
    await this.remove(tutor.id);
    return { message: 'Tutor deactivated' };
  }

  update(userId: number, updateTutorDto: Prisma.TutorUpdateInput) {
    try {
      return this.prisma.tutor.update({
        where: { userId },
        data: updateTutorDto,
      });
    } catch (error) {
      throw new Exception('Tutor not found');
    }
  }

  remove(id: number) {
    return this.prisma.tutor.delete({ where: { id } });
  }

  async findOne(userId: number) {
    try {
      const tutor = await this.prisma.tutor.findUnique({ where: { userId } });
      console.log('tutor - ', tutor);
      return tutor;
    } catch (err) {
      throw new NotFoundException('Tutor not found');
    }
  }
}
