import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const tutorsCount = await this.prisma.user.count({
      where: {
        role: Role.TUTOR,
      },
    });
    const studentsCount = await this.prisma.user.count({
      where: {
        role: Role.STUDENT,
      },
    });
    return {
      tutorsCount,
      studentsCount,
      flaggedMessagesCount: 0,
    };
  }
}
