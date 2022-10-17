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
  async findChatTutors(studentId: number) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          studentId,
        },
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const chats = await Promise.all(
        conversations.map(async (conversation) => {
          return await this.prisma.chats.findMany({
            where: {
              OR: [
                {
                  AND: [{ senderId: conversation.studentId }, { receiverId: conversation.tutorId }],
                },
                {
                  AND: [{ senderId: conversation.tutorId }, { receiverId: conversation.studentId }],
                },
              ],
            },
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          });
        }),
      );
      const chatWithTutor = await Promise.all(
        chats.flat().map(async (c) => ({
          message: c.message,
          seen: c.seen,
          createdAt: c.createdAt,
          tutor: await this.prisma.user.findFirst({
            where: {
              OR: [
                { id: c.senderId, role: 'TUTOR' },
                { id: c.receiverId, role: 'TUTOR' },
              ],
            },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_url: true,
            },
          }),
        })),
      );
      return { chats: chatWithTutor };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
