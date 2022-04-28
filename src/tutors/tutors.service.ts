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
      return tutor;
    } catch (err) {
      throw new NotFoundException('Tutor not found');
    }
  }

  async filterTutor(subject: string, postCode: number) {
    const tutors = await this.prisma.tutor.findMany({
      where: {
        AND: [
          {
            subjectOffers: {
              some: {
                title: subject,
              },
            },
          },
          {
            user: {
              postal_code: String(postCode),
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            postal_code: true,
            username: true,
            country: true,
            profile_url: true,
          },
        },
      },
    });
    return tutors;
  }

  async tutorStats(tutorId: number) {
    return {
      tutor: await this.findOne(tutorId),
      referees: await this.prisma.referees.findMany({
        where: { tutorId },
      }),

      subjects: await this.prisma.subjectOffer.findMany({
        where: { tutorId },
      }),

      documents: await this.prisma.documents.findMany({
        where: { tutorId },
      }),
      tutoringDetail: await this.prisma.tutoringDetail.findUnique({
        where: { tutorId },
      }),
    };
  }
}
