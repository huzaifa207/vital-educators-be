import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class QualificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createQualificationDto: Prisma.QualificationCreateInput, userId: number) {
    try {
      return await this.prisma.qualification.create({
        data: {
          ...createQualificationDto,
          tutor: { connect: { id: userId } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send a valid data');
      }
      throw new BadRequestException('Tutor not found');
    }
  }

  async findAll(tutorId: number) {
    try {
      return await this.prisma.qualification.findMany({
        where: { tutor: { id: tutorId } },
      });
    } catch (error) {
      throw new BadRequestException('Tutor not found');
    }
  }

  findOne(id: number) {
    try {
      return this.prisma.qualification.findUnique({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Qualification not found');
    }
  }

  async update(id: number, updateQualificationDto: Prisma.QualificationUpdateInput) {
    try {
      return await this.prisma.qualification.update({
        where: { id },
        data: updateQualificationDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send a valid data');
      }
      throw new BadRequestException('Tutor not found');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.qualification.delete({
        where: { id },
      });
      return { message: 'Qualification deleted' };
    } catch (error) {
      throw new BadRequestException('Qualification not found');
    }
  }
}
