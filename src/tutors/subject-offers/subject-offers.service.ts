import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SubjectOffersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSubjectOfferDto: Prisma.SubjectOfferCreateInput,
    tutorId: number,
  ) {
    try {
      return await this.prisma.subjectOffer.create({
        data: {
          ...createSubjectOfferDto,
          tutor: { connect: { id: tutorId } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send a valid data');
      }
      console.log(error);
      throw new NotFoundException('Tutor not found');
    }
  }

  findAll(tutorId: number) {
    try {
      return this.prisma.subjectOffer.findMany({
        where: { tutorId },
      });
    } catch (error) {
      throw new NotFoundException('Tutor not found');
    }
  }

  findOne(id: number) {
    try {
      return this.prisma.subjectOffer.findUnique({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Tutor not found');
    }
  }

  async update(
    id: number,
    tutorId: number,
    updateSubjectOfferDto: Prisma.SubjectOfferUncheckedUpdateInput,
  ) {
    try {
      if (await this.checkSubjectOffer(id, tutorId)) {
        return await this.prisma.subjectOffer.update({
          where: {
            id,
          },
          data: {
            ...updateSubjectOfferDto,
          },
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send a valid data');
      }
      throw new NotFoundException('Tutor not found');
    }
  }

  async remove(id: number, tutorId: number) {
    if (await this.checkSubjectOffer(id, tutorId)) {
      try {
        await this.prisma.subjectOffer.delete({ where: { id } });
        return { message: 'Subject offer deleted' };
      } catch (error) {
        throw new NotFoundException('Subject offer not found');
      }
    }
  }

  private async checkSubjectOffer(
    subjectOfferId: number,
    tutorId: number,
  ): Promise<Boolean> {
    const subjectOffer = await this.prisma.subjectOffer.findUnique({
      where: { id: subjectOfferId },
    });
    if (+subjectOffer.tutorId !== +tutorId) {
      throw new ForbiddenException(
        'You are not the owner of this subject offer',
      );
    }
    return true;
  }
}
