import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './../prisma.service';

export enum CHAT_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
}

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async msgFromStudent(studentId: number, tutorId: number, msg: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [{ studentId }, { tutorId }],
      },
    });
    if (!conversation) {
      await this.prisma.conversation.create({
        data: {
          studentId,
          tutorId: tutorId,
          status: CHAT_STATUS.PENDING,
        },
      });
      return {
        status: CHAT_STATUS.PENDING,
        data: null,
      };
    }
    if (conversation.status === CHAT_STATUS.PENDING) {
      return {
        status: CHAT_STATUS.PENDING,
      };
    }

    if (conversation.status === CHAT_STATUS.REJECTED) {
      return {
        status: CHAT_STATUS.REJECTED,
        data: null,
      };
    }

    if (conversation.status === CHAT_STATUS.ACCEPTED) {
      return {
        status: CHAT_STATUS.ACCEPTED,
        data: await this.createChat({
          senderId: studentId,
          receiverId: tutorId,
          message: msg,
        }),
      };
    }
  }

  async msgFromTutor(tutorId: number, studentId: number, message: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [{ tutorId }, { studentId }],
      },
    });
    if (!conversation) {
      return {
        status: CHAT_STATUS.ERROR,
        data: null,
      };
    }

    if (conversation.status === CHAT_STATUS.ACCEPTED) {
      return {
        status: CHAT_STATUS.ACCEPTED,
        data: await this.createChat({
          senderId: tutorId,
          receiverId: studentId,
          message: message,
        }),
      };
    }
  }

  async getChat(senderId: number) {
    const chats = await this.prisma.chats.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                senderId: senderId,
              },
              {
                receiverId: senderId,
              },
            ],
          },
          {
            AND: [
              {
                senderId: senderId,
              },
              {
                receiverId: senderId,
              },
            ],
          },
        ],
      },
    });
    return chats;
  }

  private async createChat(createChatDto: Prisma.ChatsCreateInput) {
    const newChat = {
      senderId: createChatDto.senderId,
      receiverId: createChatDto.receiverId,
      message: createChatDto.message,
    };
    await this.prisma.chats.create({
      data: newChat,
    });
    return newChat;
  }
}
