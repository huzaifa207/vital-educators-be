import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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

  async update(
    id: number,
    tutorId: number,
    updateRefereeDto: Prisma.RefereesUpdateInput,
  ) {
    try {
      if (await this.checkReferee(id, tutorId)) {
        return await this.prisma.referees.update({
          where: { id },
          data: updateRefereeDto,
        });
      }
    } catch (error) {
      throw new BadRequestException('Referee not found');
    }
  }

  async remove(id: number, tutorId: number) {
    try {
      if (await this.checkReferee(id, tutorId)) {
        await this.prisma.referees.delete({ where: { id } });
        return { message: 'Referee deleted' };
      }
    } catch (error) {
      throw new BadRequestException('Referee not found');
    }
  }

  private async checkReferee(
    refereeId: number,
    tutorId: number,
  ): Promise<Boolean> {
    const referee = await this.prisma.referees.findUnique({
      where: { id: refereeId },
    });
    if (+referee.tutorId !== +tutorId) {
      throw new ForbiddenException('You are not the owner of this referee');
    }
    return true;
  }
}
