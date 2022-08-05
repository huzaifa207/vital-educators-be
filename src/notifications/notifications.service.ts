import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Alert, Prisma, Notification, NotificationTargetType } from '@prisma/client';

interface PaginationOptions {
  offset: number;
  limit: number;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prismaService.notification.create({
      data,
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
