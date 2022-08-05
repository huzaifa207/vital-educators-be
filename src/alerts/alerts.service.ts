import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Alert, Prisma } from '@prisma/client';

interface PaginationOptions {
  offset: number;
  limit: number;
}

@Injectable()
export class AlertsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.AlertCreateInput): Promise<Alert> {
    return this.prismaService.alert.create({
      data,
    });
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
}
