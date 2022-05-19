import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Role } from '@prisma/client';
import { Socket } from 'socket.io';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';
import { IChat, IChatReturn } from './chat';
import { CHAT_STATUS, ConversationService } from './conversation.service';

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: [
      'https://localhost:5501',
      'https://localhost:3000',
      'https://vital-educators.vercel.app',
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

  async handleConnection(@ConnectedSocket() client: Socket) {
    const { from: id } = await this.verifyConnectedUser(client);

    const alreadyConnected = this.connectionTable.get(id);
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
    @MessageBody() { data: { receiverId: tutorId, msg } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    const { from, validUser } = await this.verifyConnectedUser(client, 'STUDENT');

    if (!validUser) {
      return { error: 'Enter Student Token' };
    }

    const { status, data } = await this.conversationService.msgFromStudent(from, tutorId, msg);
    if (status === CHAT_STATUS.PENDING || status === CHAT_STATUS.ACCEPTED) {
      return this.broadCastMsg(client, String(tutorId), 'reveiveMsgFromStudent', {
        id: data.id,
        studentId: from,
        tutorId: tutorId,
        msg: data.message,
        status,
      });
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
    const { from, validUser } = await this.verifyConnectedUser(client, 'TUTOR');

    if (!validUser) {
      return { error: 'Enter Tutor Token' };
    }

    const { data, status } = await this.conversationService.msgFromTutor(from, studentId, msg);
    if (status === CHAT_STATUS.ERROR) {
      client.broadcast.to(client.id).emit('error', 'ERROR');
    }
    if (status === CHAT_STATUS.PENDING || status === CHAT_STATUS.ACCEPTED) {
      return this.broadCastMsg(client, String(from), 'reveiveMsgFromTutor', {
        id: data.id,
        tutorId: from,
        studentId,
        msg: data.message,
        status,
      });
    }
  }

  private async verifyConnectedUser(client: Socket, checkRole?: Role) {
    const { cookie } = client.handshake.headers;

    let token = '';
    const tokenPair = cookie
      .split(';')
      .map((v) => v.trim().split('='))
      .filter((v) => v[0] == 'jwt');

    if (tokenPair && tokenPair.length > 0) {
      token = tokenPair[0][1];
      try {
        const { id: from, token: _token } = await this.tokenService.verify(token);
        if (_token) {
          client.handshake.headers['set-cookie'] = [`jwt=${_token}`];
        }
        const { role } = await this.userService.findOne(from);
        return checkRole ? { validUser: checkRole === role, from } : { validUser: true, from };
      } catch (error) {
        console.log(error.message);
      }
    } else {
      console.error('Token invalid', tokenPair);
    }
  }

  private broadCastMsg(client: Socket, socketKey: string, eventName: string, data: IChatReturn) {
    const receriverId = this.connectionTable.get(socketKey);
    if (receriverId) {
      receriverId.forEach((id: string) => {
        client.broadcast.to(id).emit(eventName, { ...data });
      });
    }
    return { data: { messageId: data.id } };
    // client.emit('sent', { id: data.id });
  }
}
