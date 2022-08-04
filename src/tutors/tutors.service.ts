import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DeleteKeys, PickKeys } from 'src/utils/helpers';
import { PrismaService } from './../prisma.service';

type GraduationLevel =
  | 'a_level'
  | 'casual_learner'
  | 'primary'
  | 'secondary'
  | 'gsce'
  | 'higher_education';

interface TutorProfileQueryOptions {
  userIncludedFields?: (keyof User)[];
  userExcludedFields?: (keyof User)[];
}

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
      throw new NotFoundException('Tutor not found');
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

  async getTutorProfile(
    userId: number,
    options: TutorProfileQueryOptions = {
      userIncludedFields: undefined,
      userExcludedFields: undefined,
    },
  ) {
    const levels: Array<GraduationLevel> = [
      'a_level',
      'casual_learner',
      'primary',
      'secondary',
      'gsce',
      'higher_education',
    ];

    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, role: 'TUTOR' },
        include: {
          tutor: {
            select: { id: true },
          },
        },
      });
      if (!user) {
        throw new NotFoundException('Tutor not found');
      }

      const tutor = await this.prisma.tutor.findUnique({
        where: { id: user.tutor.id },
        include: {
          subjectOffers: true,
          qualification: true,
          tutoringDetail: true,
        },
      });
      let pickedFields: Record<string, any> = Object.assign({}, user);
      if (options && options.userIncludedFields)
        pickedFields = PickKeys(user, options.userIncludedFields);
      if (options && options.userExcludedFields)
        pickedFields = DeleteKeys(user, options.userExcludedFields);

      return {
        user: pickedFields,
        tutor: {
          id: tutor.id,
          crb_check: tutor.crb_check,
          skype_id: tutor.skype_id,
        },
        subjects: tutor.subjectOffers.map((subject) => {
          return {
            id: subject.id,
            title: subject.title,
            level: levels
              .map((l) => {
                if (subject[l] > 0) {
                  return {
                    title: l,
                    price: subject[l],
                  };
                } else {
                  return null;
                }
              })
              .filter((e) => e !== null),
            online: subject.online,
            online_discount: subject.online,
            first_free_lesson: subject.first_free_lesson,
          };
        }),
        qualification: tutor.qualification,
        tutoringDetail: tutor.tutoringDetail,
      };
    } catch (error) {
      if (error.message === 'Tutor not found') {
        throw new NotFoundException('Tutor not found');
      }
    }
  }

  async filterTutor(subject: string, postCode: number, graduationLevel: string, skip: number) {
    const levels: Array<GraduationLevel> = [
      'a_level',
      'casual_learner',
      'primary',
      'secondary',
      'gsce',
      'higher_education',
    ];
    try {
      const graduation_level = levels.includes(graduationLevel as GraduationLevel)
        ? graduationLevel
        : null;
      const tutors = await this.prisma.tutor.findMany({
        where: {
          AND: [
            {
              deActivate: false,
            },
            {
              user: {
                postal_code: String(postCode),
                // email_approved: true,
              },
            },
            {
              subjectOffers: {
                some: {
                  title: subject.toLowerCase(),
                  AND: [
                    {
                      [graduation_level]: { gt: 0 },
                    },
                  ],
                },
              },
            },
          ],
        },
        select: {
          skype_id: true,
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
              address_1: true,
            },
          },
          qualification: {
            select: {
              degree_title: true,
              institute: true,
              level: true,
              year_of_completion: true,
            },
          },
          tutoringDetail: true,
        },

        skip,
        take: 10,
      });
      return tutors;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('tutors not found');
    }
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
