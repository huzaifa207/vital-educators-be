import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RefereesService {
  constructor(private prisma: PrismaService) {}

  async create(createRefereeDto: Prisma.RefereesCreateInput, tutorId: number) {
    // insert data in one to many relation in prisma
    const referee = await this.prisma.referees.create({
      data: {
        ...createRefereeDto,
        tutor: { connect: { id: tutorId } },
      },
    });

    // return the referee
    return referee;
  }

  async findAll(tutorId: number) {
    return await this.prisma.referees.findMany({
      where: {
        tutor: { id: tutorId },
      },
    });
  }

  async findOne(id: number) {
    return (
      (await this.prisma.referees.findUnique({ where: { id } })) || {
        message: 'Referee not found',
      }
    );
  }

  async update(id: number, updateRefereeDto: Prisma.RefereesUpdateInput) {
    return await this.prisma.referees.update({
      where: { id },
      data: updateRefereeDto,
    });
  }

  async remove(id: number) {
    try {
      await this.prisma.referees.delete({ where: { id } });
      return { message: 'Referee deleted' };
    } catch (error) {
      throw new BadRequestException('Referee not found');
    }
  }
}
