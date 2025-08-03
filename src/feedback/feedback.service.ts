import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/mail-service/mail.service';
import { reviewRequest } from 'src/mail-service/templates/review-request';
import { studentReview } from 'src/mail-service/templates/review-student';
import { reviewTutorReplyToStudentReview } from 'src/mail-service/templates/review-tutor-repy';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import Base64 from 'src/utils/base64';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
    private taskSchadularsService: TaskSchadularsService,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto) {
    const { tutorId, studentId } = createFeedbackDto;
    const { isTutorAndStudentBuySubscription, student, tutor } = await this.helper({
      tutorId,
      studentId,
    });

    if (isTutorAndStudentBuySubscription) {
      (
        await this.taskSchadularsService.sendEmailToStudentWhenStudentNotGiveFeedback({
          tutorId: tutor.id,
          studentId: student.id,
          tutorName: tutor.first_name + ' ' + tutor.last_name,
          studentName: student.first_name + ' ' + student.last_name,
          studentEmail: student.email,
        })
      ).stop();
      await this.prisma.feedback.create({
        data: {
          rating: createFeedbackDto.rating,
          comment: createFeedbackDto.comment,
          comment_reply: '',
          tutorId: tutor.tutor.id,
          studentId: student.student.id,
        },
      });
      this.mailService.sendMailSimple({
        email: tutor.email,
        text: `Student ${student.first_name} ${student.last_name} give you feedback`,
        subject: 'Feedback from student',
        emailContent: studentReview(
          student.first_name + ' ' + student.last_name,
          tutor.first_name + ' ' + tutor.last_name,
        ),
      });
      return {
        message: 'Feedback created',
        ok: true,
      };
    } else {
      throw new BadRequestException('Tutor or student not buy subscription');
    }
  }

  async replyFromTutor(feedbackId: number, comment: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: {
        id: feedbackId,
      },
    });
    if (feedback) {
      if (feedback.comment_reply) {
        throw new BadRequestException('Feedback already reply');
      }
      await this.prisma.feedback.update({
        where: {
          id: feedbackId,
        },
        data: {
          comment_reply: comment,
        },
      });

      const student = await this.prisma.student.findUnique({
        where: {
          id: feedback.studentId,
        },
        include: {
          user: {
            select: {
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      const tutor = await this.prisma.tutor.findUnique({
        where: {
          id: feedback.tutorId,
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      this.mailService.sendMailSimple({
        email: student.user.email,
        text: `Tutor ${tutor.user.first_name} ${tutor.user.last_name} reply your feedback`,
        subject: 'Feedback reply from tutor',
        emailContent: reviewTutorReplyToStudentReview(
          tutor.user.first_name + ' ' + tutor.user.last_name,
          student.user.first_name + ' ' + student.user.last_name,
        ),
      });
    } else {
      throw new NotFoundException('Feedback not found');
    }
  }

  async requestFeedback(tutorId: number, studentId: number) {
    const { isTutorAndStudentBuySubscription, student, tutor } = await this.helper({
      tutorId,
      studentId,
    });

    if (isTutorAndStudentBuySubscription) {
      const feedback = await this.prisma.feedback.findMany({
        where: {
          AND: [
            {
              tutorId: tutor.id,
            },
            {
              studentId: student.id,
            },
          ],
        },
      });
      if (feedback.length === 0) {
        (
          await this.taskSchadularsService.sendEmailToStudentWhenStudentNotGiveFeedback({
            tutorId: tutor.id,
            studentId: student.id,
            tutorName: tutor.first_name + ' ' + tutor.last_name,
            studentName: student.first_name + ' ' + student.last_name,
            studentEmail: student.email,
          })
        ).start();
        console.log('send mail');
        this.mailService.sendMailSimple({
          email: student.email,
          text: `Tutor ${tutor.first_name} ${tutor.last_name} request feedback from you`,
          subject: 'Feedback request from tutor',
          emailContent: reviewRequest({
            tutorId: String(tutor.id),
            tutorName: tutor.first_name + ' ' + tutor.last_name,
            studentId: String(student.id),
            studentName: student.first_name + ' ' + student.last_name,
          }),
        });
        return {
          message: 'Feedback request send',
          ok: true,
        };
      } else {
        throw new BadRequestException('Feedback already request');
      }
    } else {
      throw new BadRequestException('Tutor or student not buy subscription');
    }
  }

  async findAll(id: number, role: 'tutor' | 'student') {
    if (role === 'tutor') {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          tutor: {
            select: {
              id: true,
            },
          },
        },
      });
      const feedback = await this.prisma.feedback.findMany({
        where: {
          tutorId: user.tutor.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      const feedBackwithStudent = await Promise.all(
        feedback.map(async (item) => {
          const student = await this.prisma.student.findUnique({
            where: { id: item.studentId },
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  profile_url: true,
                },
              },
            },
          });
          return {
            ...item,
            student: student.user,
          };
        }),
      );
      return feedBackwithStudent;
    } else {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          student: {
            select: {
              id: true,
            },
          },
        },
      });
      const feedbacks = await this.prisma.feedback.findMany({
        where: {
          studentId: user.student.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      const feedBackwithTutor = await Promise.all(
        feedbacks.map(async (item) => {
          const tutor = await this.prisma.tutor.findUnique({
            where: { id: item.tutorId },
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  profile_url: true,
                },
              },
            },
          });
          return {
            ...item,
            tutor: tutor.user,
          };
        }),
      );
      return feedBackwithTutor;
    }
  }

  async findOne(id: number) {
    const feedback = this.prisma.feedback.findUnique({
      where: {
        id,
      },
    });
    return `This action returns a #${id} feedback`;
  }

  update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }
  async helper({ tutorId, studentId }: { tutorId: number; studentId: number }) {
    // console.log({ tutorId, studentId });
    // const users = await this.prisma.user.findMany({
    //   where: {
    //     OR: [
    //       {
    //         tutor: {
    //           id: tutorId,
    //         },
    //       },
    //       {
    //         student: {
    //           id: studentId,
    //         },
    //       },
    //     ],
    //   },
    //   select: {
    //     id: true,
    //     first_name: true,
    //     last_name: true,
    //     email: true,
    //   },
    // });
    const tutor = await this.prisma.user.findUnique({
      where: {
        id: tutorId,
      },

      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        tutor: {
          select: {
            id: true,
          },
        },
      },
    });
    const student = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        student: {
          select: {
            id: true,
          },
        },
      },
    });
    const isTutorAndStudentBuySubscription = await this.prisma.subscription.findMany({
      where: {
        OR: [
          {
            userId: tutor.id,
          },
          {
            userId: student.id,
          },
        ],
      },
    });
    return {
      tutor,
      student,
      isTutorAndStudentBuySubscription: isTutorAndStudentBuySubscription.length > 0,
    };
  }
}
