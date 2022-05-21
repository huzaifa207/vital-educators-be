import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Exception } from 'handlebars';
import { PrismaService } from './../prisma.service';

@Injectable()
export class TutorsService {
  constructor(private prisma: PrismaService) {}

  async deActivateTutor(userId: number) {
    const tutor = await this.findOneTutor(userId);
    tutor.deActivate = true;
    return { message: 'Tutor deactivated' };
  }

  updateTutor(userId: number, updateTutorDto: Prisma.TutorUpdateInput) {
    try {
      return this.prisma.tutor.update({
        where: { userId },
        data: {
          crb_check: updateTutorDto.crb_check,
          skype_id: updateTutorDto.skype_id,
          deActivate: updateTutorDto.deActivate,
        },
      });
    } catch (error) {
      throw new Exception('Tutor not found');
    }
  }

  async findOneTutor(userId: number) {
    try {
      const tutor = await this.prisma.tutor.findUnique({ where: { userId } });
      return tutor;
    } catch (err) {
      throw new NotFoundException('Tutor not found');
    }
  }

  async filterTutor(subject: string, postCode: number, skip: number) {
    const tutors = await this.prisma.tutor.findMany({
      where: {
        AND: [
          {
            deActivate: false,
          },
          {
            user: {
              postal_code: String(postCode),
              email_approved: true,
            },
          },
          {
            subjectOffers: {
              some: {
                title: subject,
              },
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
            postal_code: true,
            phone: true,
            country: true,
            profile_url: true,
          },
        },
      },
      skip,
      take: 10,
    });
    return tutors;
  }

  async tutorStats(tutorId: number) {
    return {
      tutor: await this.findOneTutor(tutorId),
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
