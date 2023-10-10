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
  getAll(
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ): Promise<Alert[]> {
    return this.prismaService.alert.findMany({
      skip: options.offset,
      take: options.limit,
    });
  }

  async dispatchTutorProfileUpdated(
    tutorId: number,
    description: string = 'Tutor just updated their profile',
  ) {
    try {
      await this.create({
        description,
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${tutorId}#profile`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchRefereeAdded(tutorId: number, refereeId: number) {
    try {
      await this.create({
        description: 'Tutor added a new referee',
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${tutorId}#referees`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchDocUpdated(tutorId: number) {
    try {
      await this.create({
        description: 'Tutor updated their official doscs',
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${tutorId}#documents`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchRefereeLeftReview(tutorId: number, refereeId: number) {
    try {
      await this.create({
        description: 'Referee left a review',
        actionURL: `${ENV['FRONTEND_URL']}/admin/tutor-detail/${tutorId}#referees`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
}
