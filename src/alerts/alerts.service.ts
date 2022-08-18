import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
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

  create(data: Prisma.AlertCreateInput): Promise<Alert> {
    const r = this.prismaService.alert.create({
      data,
    });
    try {
      this.mailService.sendMailSimple({
        email: 'mlhlk1212@gmail.com',
        emailContent: emailAlert(data.description, ENV['FRONTEND_URL']),
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

  async dispatchTutorProfileUpdated(tutorId: number) {
    try {
      await this.create({
        description: 'Tutor just updated their profile',
        actionURL: `/?event=profile_updated&tutorId=${tutorId}`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchRefereeAdded(tutorId: number, refereeId: number) {
    try {
      await this.create({
        description: 'Tutor added a new referee',
        actionURL: `/?event=referee_added&tutorId=${tutorId}&refereeId=${refereeId}`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchDocUpdated(tutorId: number) {
    try {
      await this.create({
        description: 'Tutor updated their official doscs',
        actionURL: `/?event=doc_added&tutorId=${tutorId}`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
  async dispatchRefereeLeftReview(tutorId: number, refereeId: number) {
    try {
      await this.create({
        description: 'Referee left a review',
        actionURL: `/?event=referee_left_review&tutorId=${tutorId}&docId=${refereeId}`,
      });
    } catch (er) {
      console.warn(er);
    }
  }
}
