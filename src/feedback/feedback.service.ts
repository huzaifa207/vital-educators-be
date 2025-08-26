import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { reviewRequest } from 'src/mail-service/templates/review-request';
import { studentReview } from 'src/mail-service/templates/review-student';
import { reviewTutorReplyToStudentReview } from 'src/mail-service/templates/review-tutor-repy';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import Base64 from 'src/utils/base64';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto, ApproveFeedbackDto } from './dto/update-feedback.dto';
import { feedbackRejected } from 'src/mail-service/templates/feedback-rejected';

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
            tutorId: Base64().encode(tutor.id),
            tutorName: tutor.first_name + ' ' + tutor.last_name,
            studentId: Base64().encode(student.id),
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
          status: ApprovalStatus.APPROVED,
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
          status: ApprovalStatus.APPROVED,
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

  async findAllForAdmin(status?: 'APPROVED' | 'REJECTED' | 'PENDING') {
    const whereClause = status ? { status: ApprovalStatus[status] } : {};

    const feedback = await this.prisma.feedback.findMany({
      where: whereClause,
      include: {
        Tutor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                profile_url: true,
              },
            },
          },
        },
        Student: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                profile_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return feedback.map((item) => ({
      ...item,
      tutor: item.Tutor.user,
      student: item.Student.user,
    }));
  }

  async updateApprovalStatus(id: number, approveFeedbackDto: ApproveFeedbackDto) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        Student: {
          include: {
            user: {
              select: {
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        Tutor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const updatedFeedback = await this.prisma.feedback.update({
      where: { id },
      data: {
        status: approveFeedbackDto.status,
      },
    });

    if (approveFeedbackDto.status === ApprovalStatus.REJECTED) {
      const studentName = `${feedback.Student.user.first_name} ${feedback.Student.user.last_name}`;
      const tutorName = `${feedback.Tutor.user.first_name} ${feedback.Tutor.user.last_name}`;

      this.mailService.sendMailSimple({
        email: feedback.Student.user.email,
        text: `Dear ${studentName}, your feedback for ${tutorName} has been reviewed and cannot be published due to community guideline violations.`,
        subject: 'Feedback Review Update - VitalEducators',
        emailContent: feedbackRejected(studentName, tutorName),
      });
    }

    const statusMessage = {
      [ApprovalStatus.APPROVED]: 'approved',
      [ApprovalStatus.REJECTED]: 'rejected',
      [ApprovalStatus.PENDING]: 'set to pending',
      [ApprovalStatus.NOT_ADDED]: 'marked as not added',
    };

    return {
      message: `Feedback ${statusMessage[approveFeedbackDto.status]} successfully`,
      ok: true,
      feedback: updatedFeedback,
    };
  }

  async findOne(id: number) {
    const feedback = await this.prisma.feedback.findUnique({
      where: {
        id,
      },
      include: {
        Tutor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                profile_url: true,
              },
            },
          },
        },
        Student: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                profile_url: true,
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return {
      ...feedback,
      tutor: feedback.Tutor.user,
      student: feedback.Student.user,
    };
  }

  update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }

  async helper({ tutorId, studentId }: { tutorId: number; studentId: number }) {
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
