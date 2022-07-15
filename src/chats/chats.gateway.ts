import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Role } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';
import { IChat } from './chat';
import { CHAT_STATUS, ConversationService } from './conversation.service';

type IChatFromConversation = {
  status: CHAT_STATUS;
  data:
    | string
    | {
        id: number;
        createdAt: Date;
        senderId: number;
        receiverId: number;
        message: any;
      };
};

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: [
      'https://vital-educators.vercel.app',
      'https://localhost:5501',
      'https://localhost:3000',
    ],
  },
})
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
  ) {}
  private connectionTable = new Map();

  private logger: Logger = new Logger('StudentGateway');

  afterInit() {
    this.logger.log('Student Gateway Initialize!');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client DisConnected: ', client.id);
  }

  @WebSocketServer() server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    const res = await this.verifyConnectedUser(client);
    if (!res.validUser || !res.from) {
      return { error: 'Enter Tutor Token' };
    }

    const { from: id } = res;

    const alreadyConnected = this.connectionTable.get(res.from);
    if (alreadyConnected) {
      alreadyConnected.push(client.id);
    } else {
      this.connectionTable.set(id, [client.id]);
    }

    //---------------- GET CHAT LIST ----------------
    const data = await this.conversationService.getChat(id);
    console.log('all data = ', JSON.stringify(data));
    client.emit('receiveMsg', data);

    // Data arragnemnt
    /**
     * [ -> Array of conversations
     *   {
     *
     *      userData:{
     *        userId: 1234,
     *        name: 123,
     *        email:123,
     *      },
     *      messages: [
     *        {
     *        msgId:
     *        msg:"hello",
     *        sentBy:"self|other",
     *        seen:false,
     *        createdAt:123
     *        }
     *      ]
     *
     *   }
     * ]
     *
     */
  }

  // Message to Server

  @SubscribeMessage('sendMsgFromStudent')
  async msgFromStudent(
    @MessageBody() { data: { msg, receiverId } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    const res = await this.verifyConnectedUser(client, 'STUDENT');

    if (!res.validUser || !res.from) {
      return { error: 'Enter Student Token' };
    }
    const { from, user } = res;
    const { status, data } = await this.conversationService.msgFromStudent(
      from,
      receiverId,
      msg,
      user,
    );

    if (status === CHAT_STATUS.ERROR) {
      client.broadcast.to(client.id).emit('error', data);
      return { error: data };
    }

    if (
      (status === CHAT_STATUS.PENDING || status === CHAT_STATUS.APPROVED) &&
      typeof data !== 'string'
    ) {
      this.broadCastMsg(receiverId, 'reveiveMsgFromStudent', {
        id: data.id,
        studentId: from,
        tutorId: receiverId,
        msg: data.message,
        createdAt: data.createdAt,
        status,
      });
      return { data: { messageId: data.id } };

      // return { error: 'PENDING' };
    }

    if (status === CHAT_STATUS.REJECTED) {
      client.broadcast.to(client.id).emit('rejected', 'REJECTED');
    }
  }

  @SubscribeMessage('sendMsgFromTutor')
  async msgFromTutor(
    @MessageBody() { data: { receiverId: studentId, msg } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    const res = await this.verifyConnectedUser(client, 'TUTOR');

    if (!res.validUser || !res.from) {
      return { error: 'Enter TUTOR Token' };
    }
    const { from } = res;

    const { data, status } = await this.conversationService.msgFromTutor(from, studentId, msg);
    if (status === CHAT_STATUS.ERROR) {
      client.broadcast.to(client.id).emit('error', data);
      return { error: data };
    }
    if (
      (status === CHAT_STATUS.PENDING || status === CHAT_STATUS.APPROVED) &&
      typeof data !== 'string'
    ) {
      this.broadCastMsg(studentId, 'reveiveMsgFromTutor', {
        id: data.id,
        tutorId: from,
        studentId,
        msg: data.message,
        createdAt: data.createdAt,
        status,
      });
      return { data: { messageId: data.id } };
    }
  }

  @SubscribeMessage('sendMsg')
  async sendMsg(
    @MessageBody()
    { data: { receiverId, msg, role } }: { data: { receiverId: number; msg: string; role: Role } },
    @ConnectedSocket() client: Socket,
  ) {
    const res = await this.verifyConnectedUser(client, 'STUDENT');

    if (!res.validUser || !res.from) {
      return { error: 'Enter Student Token' };
    }
    const { from, user } = res;

    let chat: IChatFromConversation;
    if (role === 'STUDENT') {
      chat = await this.conversationService.msgFromStudent(from, receiverId, msg, user);
    }

    if (role === 'TUTOR') {
      chat = await this.conversationService.msgFromTutor(from, receiverId, msg);
    }
    const { data, status } = chat;

    if (chat.status === CHAT_STATUS.ERROR) {
      client.broadcast.to(client.id).emit('error', chat.data);
      return { error: data };
    }

    if (
      (status === CHAT_STATUS.PENDING || status === CHAT_STATUS.APPROVED) &&
      typeof data !== 'string'
    ) {
      const eventName = role === 'STUDENT' ? 'reveiveMsgFromStudent' : 'reveiveMsgFromTutor';
      this.broadCastMsg(receiverId, eventName, {
        id: data.id,
        studentId: role === 'STUDENT' ? from : receiverId,
        tutorId: role === 'TUTOR' ? from : receiverId,
        msg: data.message,
        createdAt: data.createdAt,
        status: status,
      });
      return { data: { messageId: data.id } };
    }
  }

  @SubscribeMessage('seenMsg')
  async seenMsg(
    @MessageBody() { data: { msgIds } }: { data: { msgIds: number[] } },
    @ConnectedSocket() client: Socket,
  ) {
    const res = await this.verifyConnectedUser(client);

    if (!res.validUser || !res.from) {
      return { error: 'User not verified' };
    }
    const { data } = await this.conversationService.seenMsg(msgIds);
    this.broadCastMsg(data[0].senderId, 'msgSeen', {
      data,
    });
    return { data };
  }

  private async verifyConnectedUser(client: Socket, checkRole?: Role) {
    let token = '';
    let tokenPair;
    try {
      const { cookie } = client.handshake.headers;
      if (!cookie) {
        return { validUser: false };
      }
      tokenPair = cookie
        .split(';')
        .map((v) => v.trim().split('='))
        .filter((v) => v[0] == 'jwt');
      if (tokenPair.length === 0) {
        return { validUser: false };
      }
    } catch (error) {
      console.log('socket conenction error - ', error);
    }

    if (tokenPair && tokenPair.length > 0) {
      token = tokenPair[0][1];

      try {
        const { id: from } = await this.tokenService.verify(token);
        // if (_token) {
        //   client.handshake.headers['set-cookie'] = [`jwt=${_token}`];
        // }
        const user = await this.userService.findOne(from);
        return checkRole
          ? { validUser: checkRole === user.role, from, user }
          : { validUser: true, from };
      } catch (error) {
        console.log(error.message);
      }
    } else {
      console.error('Token invalid', tokenPair);
    }
  }

  private broadCastMsg(socketKey: number, eventName: string, data: any) {
    const receriverId = this.connectionTable.get(socketKey);
    if (receriverId) {
      receriverId.forEach((id: string) => {
        this.server.to(id).emit(eventName, { ...data });
      });
    }
    // return { data: { messageId: data.id } };
  }
}
