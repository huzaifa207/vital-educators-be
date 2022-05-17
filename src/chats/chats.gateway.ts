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
import { Socket } from 'socket.io';
import { TokenService } from 'src/token/token.service';
import { IChat } from './chat';
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
    const { cookie } = client.handshake.headers;
    const token = this.extractToken(cookie);
    const { id } = await this.tokenService.verifyToken(token);

    const alreadyConnected = this.connectionTable.get(id);
    if (alreadyConnected) {
      alreadyConnected.push(client.id);
    } else {
      this.connectionTable.set(id, [client.id]);
    }

    //---------------- GET CHAT LIST ----------------
    console.log('>Emiting receiveMsg ', id);
    const data = await this.conversationService.getChat(id);
    console.log('>Data', JSON.stringify(data));
    client.emit('reveiveMsg', data);

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
    @MessageBody() { data: { tutorId, msg } }: { data: Partial<IChat> },
    @ConnectedSocket() client: Socket,
  ) {
    // const token = client.handshake.headers.authorization.split(' ')[1];
    const { cookie } = client.handshake.headers;
    const token = this.extractToken(cookie);
    const { id: from } = await this.tokenService.verifyStudentToken(token);
    const {
      status,
      data: { senderId, receiverId, message },
    } = await this.conversationService.msgFromStudent(from, tutorId, msg);

    if (status === CHAT_STATUS.PENDING) {
      this.broadCastMsg(client, String(tutorId), 'reveiveMsgFromStudent', {
        studentId: senderId,
        tutorId: receiverId,
        msg: message,
        status,
      });
    }

    if (status === CHAT_STATUS.REJECTED) {
      client.broadcast.to(client.id).emit('rejected', 'REJECTED');
    }

    if (status === CHAT_STATUS.ACCEPTED) {
      this.logger.log({ tutorId, msg });
      this.broadCastMsg(client, String(tutorId), 'reveiveMsgFromStudent', {
        studentId: senderId,
        tutorId: receiverId,
        msg: message,
        status,
      });

      // let receriverId = this.connectionTable.get(tutorId);
      // if (receriverId) {
      //   receriverId.forEach((id: string) => {
      //     client.broadcast.to(id).emit('reveiveMsgFromStudent', {
      //       studentId: senderId,
      //       tutorId: receiverId,
      //       msg: message,
      //       status,
      //     });
      //   });
      // }
    }
  }

  @SubscribeMessage('sendMsgFromTutor')
  async msgFromTutor(
    @MessageBody() { data: { studentId, msg } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    const { cookie } = client.handshake.headers;
    const token = this.extractToken(cookie);
    const { id: from } = await this.tokenService.verifyTutorToken(token);
    const { data, status } = await this.conversationService.msgFromTutor(from, studentId, msg);
    if (status === CHAT_STATUS.ERROR) {
      client.broadcast.to(client.id).emit('error', 'ERROR');
    }
    if (status === CHAT_STATUS.ACCEPTED) {
      this.broadCastMsg(client, String(studentId), 'reveiveMsgFromTutor', {
        tutorId: from,
        studentId,
        msg: data.message,
        status,
      });

      // let receriverId = this.connectionTable.get(studentId);
      // if (receriverId) {
      //   receriverId.forEach((id: string) => {
      //     client.broadcast.to(id).emit('reveiveMsgFromTutor', {
      //       tutorId: from,
      //       studentId,
      //       msg: data,
      //       status,
      //     });
      //   });
      // }
    }
  }

  private extractToken(cookie: string) {
    let token = '';
    const tokenPair = cookie
      .split(';')
      .map((v) => v.trim().split('='))
      .filter((v) => v[0] == 'jwt');

    if (tokenPair && tokenPair.length > 0) {
      token = tokenPair[0][1];
      return token;
    } else {
      console.error('Token invalid', tokenPair);
    }
  }

  private broadCastMsg(client: Socket, socketKey: string, eventName: string, data: IChat) {
    const receriverId = this.connectionTable.get(socketKey);
    if (receriverId) {
      receriverId.forEach((id: string) => {
        client.broadcast.to(id).emit(eventName, { ...data });
      });
    }
  }
}
