import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Chats, FlaggedMessage, Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { emailAlert } from 'src/mail-service/templates/email-alert';
import { ENV } from 'src/settings';
import { AlertsService } from 'src/alerts/alerts.service';

interface PaginationOptions {
  offset: number;
  limit: number;
}

@Injectable()
export class FlaggedMessagesService {
  constructor(
    private readonly alertService: AlertsService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(sentById: number, sentToId: number, message: string): Promise<FlaggedMessage> {
    const r = await this.prismaService.flaggedMessage.create({
      data: {
        sentBy: { connect: { id: sentById } },
        sentTo: { connect: { id: sentToId } },
        message: message,
      },
    });
    let msg = message.substring(0, 30);
    if (msg.length != message.length) msg += '...';
    try {
      this.alertService.create({
        actionURL: `${ENV['FRONTEND_URL']}/admin/flagged-messages`,
        description: 'New Flagged Message: ' + msg,
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
  ): Promise<FlaggedMessage[]> {
    return this.prismaService.flaggedMessage.findMany({
      skip: options.offset,
      take: options.limit,
      where: {
        isArchived: false,
      },
    });
  }
  async delete(messageId: number): Promise<void> {
    await this.prismaService.flaggedMessage.delete({
      where: {
        id: messageId,
      },
    });
  }
  getAllArchived(
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ): Promise<FlaggedMessage[]> {
    return this.prismaService.flaggedMessage.findMany({
      skip: options.offset,
      take: options.limit,
      where: {
        isArchived: true,
      },
    });
  }
}
