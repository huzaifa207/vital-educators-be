import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma-module/prisma.service';

@Injectable()
export class TutoringDetailsService {
  constructor(private prisma: PrismaService) {}
  async create(createTutoringDetailDto: Prisma.TutoringDetailCreateInput, tutorId: number) {
    try {
      return await this.prisma.tutoringDetail.create({
        data: {
          ...createTutoringDetailDto,
          tutor: { connect: { id: tutorId } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send a valid data');
      }
      console.log(error);
      throw new BadRequestException('Tutor not found');
    }
  }

  async findAll(tutorId: number) {
    try {
      return await this.prisma.tutoringDetail.findMany({
        where: { tutor: { id: tutorId } },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Tutor not found');
    }
  }

  async findOne(id: number) {
    const tutoringDetail = await this.prisma.tutoringDetail.findUnique({
      where: { id },
    });
    if (!tutoringDetail) {
      throw new BadRequestException('TutoringDetail not found');
    }
    return tutoringDetail;
  }

  update(tutorId: number, updateTutoringDetailDto: Prisma.TutoringDetailUpdateInput) {
    try {
      return this.prisma.tutoringDetail.update({
        where: { tutorId },
        data: updateTutoringDetailDto,
      });
    } catch (error) {
      throw new BadRequestException('Tutor not found');
    }
  }

  async remove(tutorId: number) {
    try {
      await this.prisma.tutoringDetail.delete({
        where: { tutorId },
      });
      return { message: 'TutoringDetail deleted' };
    } catch (error) {
      throw new BadRequestException('Tutor not found');
    }
  }
}
