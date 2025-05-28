import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-module/prisma.service';
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
    return await this.prismaService.notification.update({
      where: { id: notifId },
      data: { isArchived: true },
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
      where: { isArchived: false },
    });
  }
  getArchived(
    options: Partial<PaginationOptions> = {
      limit: undefined,
      offset: 0,
    },
  ): Promise<Notification[]> {
    return this.prismaService.notification.findMany({
      skip: options.offset,
      take: options.limit,
      where: { isArchived: true },
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
        OR: [{ role }, { role: NotificationRole.ALL }],
        isArchived: false,
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
        isArchived: false,
      },
    });
  }
}
