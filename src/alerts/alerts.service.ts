import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { Alert, Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { emailAlert } from 'src/mail-service/templates/email-alert';
import { ENV } from 'src/settings';

interface PaginationOptions {
  offset: number;
  limit: number;
}

@Injectable()
export class AlertsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(data: Prisma.AlertCreateInput): Promise<Alert> {
    const r = await this.prismaService.alert.create({
      data,
    });
    try {
      this.mailService.sendMailSimple({
        email: 'vitaleducator@gmail.com',
        emailContent: emailAlert(data.description, data.actionURL),
        subject: 'New Admin Alert',
        text: data.description.slice(0, 30) + '...',
      });
    } catch (er) {
      console.warn(er);
    }
    return r;
  }
  async getAll(options: Partial<PaginationOptions> = { limit: undefined, offset: 0 }) {
    const [alerts, totalCount] = await Promise.all([
      this.prismaService.alert.findMany({
        skip: options.offset,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.alert.count(),
    ]);

    return {
      alerts,
      length: totalCount,
      offset: options.offset,
      limit: options.limit,
    };
  }

  async dispatchUserProfileUpdated(userId: number, description: string) {
    try {
      const userType = description.toLowerCase().includes('tutor') ? 'tutor' : 'student';

      await this.create({
        description,
        actionURL: `${ENV['FRONTEND_URL']}/admin/${userType}-detail/${userId}#profile`,
      });
    } catch (er) {
      console.warn(er);
    }
  }

  async dispatchRefereeAdded(userId: number) {
    try {
      await this.create({
        description: 'Tutor added a new referee',
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${userId}#referees`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchDocUpdated(userId: number) {
    try {
      await this.create({
        description: 'Tutor updated their official docs',
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${userId}#documents`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchRefereeLeftReview(userId: number) {
    try {
      await this.create({
        description: 'Referee left a review',
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${userId}#referees`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchStudentRegistered(userId: number) {
    try {
      await this.create({
        description: 'New student has been registered',
        actionURL: `${ENV['FRONTEND_URL']}/admin/student-detail/${userId}`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
}
