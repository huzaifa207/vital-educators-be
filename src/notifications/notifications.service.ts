import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Alert,
  Prisma,
  Notification,
  NotificationTargetType,
  NotificationRole,
} from '@prisma/client';
import { PaginationOptions } from 'src/utils/types';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prismaService.notification.create({
      data,
    });
  }
  async deleteOne(notifId: number): Promise<Notification> {
    return await this.prismaService.notification.delete({
      where: { id: notifId },
    });
  }
  getAll(
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ): Promise<Notification[]> {
    return this.prismaService.notification.findMany({
      skip: options.offset,
      take: options.limit,
    });
  }
  getGlobal(
    role: NotificationRole | undefined,
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ): Promise<Notification[]> {
    return this.prismaService.notification.findMany({
      skip: options.offset,
      take: options.limit,
      where: {
        targetType: NotificationTargetType.GLOBAL,
        role,
      },
    });
  }
  getUser(
    userId: number,
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ): Promise<Notification[]> {
    return this.prismaService.notification.findMany({
      skip: options.offset,
      take: options.limit,
      where: {
        targetType: NotificationTargetType.USER,
        targetId: userId,
      },
    });
  }
}
