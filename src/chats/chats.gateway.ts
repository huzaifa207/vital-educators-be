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
  credentials: true,
  cors: {
    origin: ['https://localhost:5501', 'https://vital-educators.vercel.app'],
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
    const token = cookie.split('=')[1];
    const { id } = await this.tokenService.verifyToken(token);

    const alreadyConnected = this.connectionTable.get(id);
    if (alreadyConnected) {
      alreadyConnected.push(client.id);
    } else {
      this.connectionTable.set(id, [client.id]);
    }

    //---------------- GET CHAT LIST ----------------

    const data = await this.conversationService.getChat(id);
    client.broadcast.to(client.id).emit('reveiveMsg', { ...data });
  }

  // Message to Server

  @SubscribeMessage('sendMsgFromStudent')
  async msgFromStudent(
    @MessageBody() { data: { tutorId, msg } }: { data: Partial<IChat> },
    @ConnectedSocket() client: Socket,
  ) {
    // const token = client.handshake.headers.authorization.split(' ')[1];
    const token = client.handshake.headers.cookie;
    console.log('token from chat module = ', token);
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
    const token = client.handshake.headers.authorization.split(' ')[1];
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

  private broadCastMsg(client: Socket, socketKey: string, eventName: string, data: IChat) {
    const receriverId = this.connectionTable.get(socketKey);
    if (receriverId) {
      receriverId.forEach((id: string) => {
        client.broadcast.to(id).emit(eventName, { ...data });
      });
    }
  }
}
