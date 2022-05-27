import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { UsersService } from 'src/users/users.service';
import { is_valid_msg, remove_bad_words } from 'src/utils/message_validation';
import { PrismaService } from './../prisma.service';

export enum CHAT_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
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
    profile_url: string;
  };
  message: TMessage[];
  status: string;
}

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private mailService: MailService,
    private taskSchadularsService: TaskSchadularsService,
  ) {}

  async msgFromStudent(
    studentId: number,
    tutorId: number,
    msg: string,
    student: Prisma.UserCreateManyInput,
  ) {
    const { error, valid } = is_valid_msg(msg);
    if (!valid) {
      return {
        status: CHAT_STATUS.ERROR,
        data: error,
      };
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [{ studentId }, { tutorId }],
      },
    });

    if (!conversation) {
      const { email: tutorEmail } = await this.userService.findOne(tutorId);

      // SENGING EMAIL TO TUTOR FOR STUDENT FIRST TIME CHAT

      await this.mailService.sendMail(
        new EmailUtility({
          name: `${student.first_name} ${student.last_name}`,
          email: tutorEmail,
          action: EmailType.FIRST_MESSAGE,
          other: {
            country: student.country,
            profile_url: student.profile_url,
          },
        }),
      );

      const { id } = await this.prisma.conversation.create({
        data: {
          studentId,
          tutorId,
          status: CHAT_STATUS.PENDING,
        },
      });

      (await this.taskSchadularsService.tutorReplySchedular(id, tutorId, student)).start();

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
        data: 'You are not allowed to chat with this tutor',
      };
    }

    if (conversation.status === CHAT_STATUS.APPROVED) {
      return {
        status: CHAT_STATUS.APPROVED,
        data: await this.createChat({
          senderId: studentId,
          receiverId: tutorId,
          message: msg,
        }),
      };
    }
  }

  async msgFromTutor(tutorId: number, studentId: number, message: string) {
    // CHECK IF MESSAGE IS VALID {not contain email or mobile number}
    const { error, valid } = is_valid_msg(message);
    if (!valid) {
      return {
        status: CHAT_STATUS.ERROR,
        data: error,
      };
    }
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [{ tutorId }, { studentId }],
      },
    });
    if (!conversation) {
      return {
        status: CHAT_STATUS.ERROR,
        data: "You can't send message to student before student start chat",
      };
    }

    if (conversation && conversation.tutorReply === false) {
      await this.prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          tutorReply: true,
        },
      });
      (await this.taskSchadularsService.tutorReplySchedular(conversation.id, tutorId)).stop();
    }

    if (
      conversation.status === CHAT_STATUS.APPROVED ||
      conversation.status === CHAT_STATUS.PENDING
    ) {
      return {
        status: CHAT_STATUS.APPROVED,
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
        const { status } = await this.prisma.conversation.findFirst({
          where: {
            AND: [{ studentId: clientId }, { tutorId: participantId }],
          },
        });

        const { first_name, last_name, email, profile_url } = await this.userService.findOne(
          participantId,
        );
        conv = {
          participantId: participantId,
          participantData: {
            firstName: first_name,
            lastName: last_name,
            email: email,
            profile_url,
          },
          message: [],
          status,
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
      message: remove_bad_words(createChatDto.message),
    };
    try {
      const { id, createdAt } = await this.prisma.chats.create({
        data: newChat,
      });
      return { ...newChat, id, createdAt };
    } catch (error) {
      console.error('save message error- ', error);
    }
  }

  async seenMsg(chatId: number) {
    try {
      const { id } = await this.prisma.chats.update({
        where: {
          id: chatId,
        },
        data: {
          seen: true,
        },
      });
      return { seen: true, id };
    } catch (error) {
      console.error('seen message error- ', error);
    }
  }
}
