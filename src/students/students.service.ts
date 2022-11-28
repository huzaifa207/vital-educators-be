import { BadRequestException, Injectable } from '@nestjs/common';
import { PurchaseStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService, private stripe: StripeService) {}

  // createStudentProfile(userId: number, profile: string) {
  //   try {
  //     const newStudentProfile = this.prisma.student.create({
  //       data: {
  //         profile_pic: profile,
  //         user: { connect: { id: userId } },
  //       },
  //     });
  //     return newStudentProfile;
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }

  async accumulateCredits(studentId: number, accumulator: number) {
    const r = await this.getStudentPaymentRecord(studentId);
    const newCredits = Math.max(r.credits + accumulator, 0); // non -ve only
    await this.prisma.studentPayment.update({
      where: {
        userId: studentId,
      },
      data: { credits: newCredits },
    });
    return newCredits;
  }
  async setPurchaseStatus(purchaseId: number, status: 'Active' | 'Delete' | 'Suspend') {
    let pStatus: PurchaseStatus = PurchaseStatus.Active;
    switch (status) {
      case 'Active':
        pStatus = PurchaseStatus.Active;
        break;
      case 'Delete':
        pStatus = PurchaseStatus.Deleted;
        break;
      case 'Suspend':
        pStatus = PurchaseStatus.Suspended;
        break;
      default:
        throw new BadRequestException('invalid status');
    }
    await this.prisma.studentPurchase.update({
      where: { id: purchaseId },
      data: { status: pStatus },
    });
    return status;
  }
  async getPurchases(studentId: number, includeDeleted = true) {
    const d = includeDeleted ? {} : { status: PurchaseStatus.Deleted };
    return this.prisma.studentPurchase.findMany({
      where: { AND: [{ userId: studentId }, { NOT: d }] },
      include: { tutor: true },
    });
  }
  async stripePurchaseIntent(studentId: number, tutorId: number) {
    const student = await this.getStudentPaymentRecord(studentId);

    const intent = await this.stripe.createTutorPurchaseToken(
      student.customerId,
      studentId,
      tutorId,
    );

    return {
      id: intent.id,
      secret: intent.client_secret,
    };
  }
  async creditPurchase(studentId, tutorId: number) {
    const record = await this.getStudentPaymentRecord(studentId);
    if (record.credits <= 0) throw new Error('insufficient credit');
    if (await this.hasStudentPurchaseTutor(studentId, tutorId)) {
      throw new Error('already purchased');
    }
    await this.accumulateCredits(studentId, -1);

    return await this.prisma.studentPurchase.create({
      data: {
        user: { connect: { userId: studentId } },
        tutor: { connect: { id: tutorId } },
        method: 'Credit',
      },
    });
  }

  async hasStudentPurchaseTutor(studentId: number, tutorId: number) {
    return (
      (await this.prisma.studentPurchase.count({
        where: { AND: [{ userId: studentId, tutorId: tutorId }], NOT: { status: 'Deleted' } },
      })) > 0
    );
  }
  async getStudentPaymentRecord(userId: number) {
    try {
      const r = await this.prisma.studentPayment.findUnique({ where: { userId: userId } });
      if (!r) throw new Error('payment record of ' + userId + " doesn't exists");
      return r;
    } catch (er) {
      return await this.createPaymentRecord(userId);
    }
  }
  async createPaymentRecord(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const customer = await this.stripe.getStripe().customers.create({
        email: user.email,
        name: user.first_name + ' ' + user.last_name,
        metadata: { role: 'STUDENT' },
      });
      return await this.prisma.studentPayment.create({
        data: { user: { connect: { id: userId } }, credits: 0, customerId: customer.id },
      });
    } catch (er) {
      throw er;
    }
  }
  async findByUserId(userId: number) {
    try {
      return await this.prisma.student.findUnique({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async findChatTutors(studentId: number) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          studentId,
        },
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const chats = await Promise.all(
        conversations.map(async (conversation) => {
          return await this.prisma.chats.findMany({
            where: {
              OR: [
                {
                  AND: [{ senderId: conversation.studentId }, { receiverId: conversation.tutorId }],
                },
                {
                  AND: [{ senderId: conversation.tutorId }, { receiverId: conversation.studentId }],
                },
              ],
            },
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          });
        }),
      );
      const chatWithTutor = await Promise.all(
        chats.flat().map(async (c) => ({
          message: c.message,
          seen: c.seen,
          createdAt: c.createdAt,
          tutor: await this.prisma.user.findFirst({
            where: {
              OR: [
                { id: c.senderId, role: 'TUTOR' },
                { id: c.receiverId, role: 'TUTOR' },
              ],
            },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_url: true,
            },
          }),
        })),
      );
      return { chats: chatWithTutor };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
