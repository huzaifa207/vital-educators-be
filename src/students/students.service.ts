import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-module/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  // createStudentProfile(userId: number, profile: string) {
  //   try {
  //     const newStudentProfile = this.prisma.student.create({
  //       data: {
  //         profile_pic: profile,
  //         user: { connect: { id: userId } },
  //       },
  //     });
  //     return newStudentProfile;
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }

  async findByUserId(userId: number) {
    try {
      return await this.prisma.student.findUnique({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
