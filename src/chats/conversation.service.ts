import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from './../prisma.service';

export enum CHAT_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
}

type TMessage = { id: number; msg: string; createdAt: Date; sentBy: 'SELF' | 'PARTICIPIANT' };
interface IConversation {
  participantId: number;
  participantData: {
    firstName: string;
    lastName: string;
    email: string;
  };
  message: TMessage[];
}

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService, private readonly userService: UsersService) {}

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
          tutorId,
          status: CHAT_STATUS.PENDING,
        },
      });
      return {
        status: CHAT_STATUS.PENDING,
        data: await this.createChat({
          senderId: studentId,
          receiverId: tutorId,
          message: msg,
        }),
      };
    }

    if (conversation.status === CHAT_STATUS.PENDING) {
      return {
        // status: CHAT_STATUS.PENDING,
        status: CHAT_STATUS.PENDING,
        data: await this.createChat({
          senderId: studentId,
          receiverId: tutorId,
          message: msg,
        }),
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

    if (
      conversation.status === CHAT_STATUS.ACCEPTED ||
      conversation.status === CHAT_STATUS.PENDING
    ) {
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

  async getChat(clientId: number) {
    const chats = await this.prisma.chats.findMany({
      where: {
        OR: [{ senderId: clientId }, { receiverId: clientId }],
        // senderId: clientId,
      },
    });

    const conversations: IConversation[] = [];
    for (const chatMessage of chats) {
      const participantId =
        chatMessage.senderId === clientId ? chatMessage.receiverId : chatMessage.senderId;
      const ind = conversations.findIndex((con) => con.participantId === participantId);
      let conv: typeof conversations[0];

      if (ind >= 0) {
        // already conversation created
        conv = conversations[ind];
      } else {
        // create conv
        const { first_name, last_name, email } = await this.userService.findOne(participantId);
        conv = {
          participantId: participantId,
          participantData: {
            firstName: first_name,
            lastName: last_name,
            email: email,
          },
          message: [],
        };
        conversations.push(conv);
      }

      conv.message.push({
        id: chatMessage.id,
        msg: chatMessage.message,
        createdAt: chatMessage.createdAt,
        sentBy: chatMessage.senderId === clientId ? 'SELF' : 'PARTICIPIANT',
      });
    }
    return conversations || [];
  }

  private async createChat(createChatDto: {
    senderId: number;
    receiverId: number;
    message: string;
  }) {
    const newChat = {
      senderId: createChatDto.senderId,
      receiverId: createChatDto.receiverId,
      message: createChatDto.message,
    };
    try {
      const { id } = await this.prisma.chats.create({
        data: newChat,
      });
      return { ...newChat, id };
    } catch (error) {
      console.error('save message error- ', error);
    }
  }
}
