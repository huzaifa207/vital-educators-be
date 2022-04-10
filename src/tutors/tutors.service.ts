import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './../prisma.service';

@Injectable()
export class TutorsService {
  constructor(private prisma: PrismaService) {}

  create(createTutorDto: Prisma.TutorCreateInput, userId: number) {
    try {
      return this.prisma.tutor.create({
        data: {
          ...createTutorDto,
          user: { connect: { id: userId } },
        },
      });
    } catch (error) {
      throw new BadGatewayException('Tutor already exists');
    }
  }

  async deActivateTutor(userId: number) {
    const tutor = await this.findOne(userId);
    tutor.deActivate = true;
    await this.remove(tutor.id);
    return { message: 'Tutor deactivated' };
  }

  update(id: number, updateTutorDto: Prisma.TutorUpdateInput) {
    return this.prisma.tutor.update({
      where: { id },
      data: updateTutorDto,
    });
  }

  remove(id: number) {
    return this.prisma.tutor.delete({ where: { id } });
  }

  findOne(userId: number) {
    try {
      return this.prisma.tutor.findUnique({ where: { userId } });
    } catch (err) {
      throw new NotFoundException('Tutor not found');
    }
  }
}
