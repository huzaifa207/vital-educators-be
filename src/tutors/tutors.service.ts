import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { UsersService } from 'src/users/users.service';
import { DeleteKeys, PickKeys } from 'src/utils/helpers';
import { PaginationOptions } from 'src/utils/types';

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
  constructor(
    private prisma: PrismaService,
    // private userService: UsersService,
    private stripeService: StripeService,
  ) {}

  async pendingTutors(
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ) {
    const tutors = await this.prisma.tutor.findMany({
      skip: options.offset,
      take: options.limit,
      where: {
        is_account_approved: ApprovalStatus.PENDING,
      },
      include: {
        user: true,
      },
    });

    return tutors;
  }
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
          ...updateTutorDto,
        },
      });
    } catch (error) {
      throw new NotFoundException('Tutor not found');
    }
  }

  async getSubscriptionByCustomerId(customerId: string) {
    return this.prisma.subscription.findUnique({ where: { customerId: customerId } });
  }

  async createSubscription(userId: number) {
    const customerId = (await this.getSubscription(userId)).customerId;
    return this.stripeService.createSubscription(customerId);
  }

  async cancelSubscription(userId: number) {
    const subId = (await this.getSubscription(userId)).subscriptionId;
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelled: true,
      },
    });
    return this.stripeService
      .getStripe()
      .subscriptions.update(subId, { cancel_at_period_end: true });
  }

  async cancelSubscriptionInstant(userId: number) {
    const subId = (await this.getSubscription(userId)).subscriptionId;
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelled: false,
        subscriptionId: '',
        status: 'INACTIVE',
      },
    });
    return this.stripeService.getStripe().subscriptions.cancel(subId);
  }
  async reinstateSubscription(userId: number) {
    const subId = (await this.getSubscription(userId)).subscriptionId;
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelled: false,
      },
    });
    return this.stripeService
      .getStripe()
      .subscriptions.update(subId, { cancel_at_period_end: false });
  }

  async createSubscriptionRecord(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      const customer = await this.stripeService.getStripe().customers.create({
        email: user.email,
        name: user.first_name + ' ' + user.last_name,
        metadata: { role: 'TUTOR' },
      });
      console.log('Created customer:', customer.id);
      return await this.prisma.subscription.create({
        data: {
          customerId: customer.id,
          subscriptionId: '',
          user: { connect: { id: userId } },
        },
      });
    } catch (er) {
      console.log('Failed to create stripe customer');
      console.warn(er);
      throw new Error('Failed to create customer record');
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

  async getSubscription(userId: number) {
    try {
      let subscription = await this.prisma.subscription.findUnique({ where: { userId } });
      if (!subscription) {
        console.log('Created new sub');
        subscription = await this.createSubscriptionRecord(userId);
      }
      return subscription;
    } catch (err) {
      throw new NotFoundException('Subscription record not found');
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
          subscription: true,
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
          is_account_approved: tutor.is_account_approved,
          is_profile_pic_approved: tutor.is_profile_pic_approved,
          is_government_document_approved: tutor.is_government_document_approved,
          is_qualification_document_approved: tutor.is_qualification_document_approved,
          is_referee_approved: tutor.is_referee_approved,
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
                block_status: false,
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
