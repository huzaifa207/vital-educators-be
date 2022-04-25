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
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/token/token.service';
import { IChat } from './chat';
import { CHAT_STATUS, ConversationService } from './conversation.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly tokenService: TokenService,
  ) {}
  private chat = new Map();
  private inc = 0;

  private logger: Logger = new Logger('StudentGateway');

  afterInit(server: Server) {
    this.logger.log('Student Gateway Initialize!');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client DisConnected: ', client.id);
  }

  async handleConnection(client: any, ...args: any[]) {
    const token = client.handshake.headers.authorization.split(' ')[1];
    const { id } = await this.tokenService.verifyToken(token);

    const alreadyConnected = this.chat.get(token);
    if (alreadyConnected) {
      alreadyConnected.push(client.id);
    } else {
      this.chat.set(token, [client.id]);
    }

    //---------------- GET CHAT LIST ----------------

    const data = await this.conversationService.getChat(+id);
    let receriverId = this.chat.get(id);
    if (receriverId) {
      receriverId.forEach((id: string) => {
        client.broadcast.to(id).emit('reveiveMsg', { ...data });
      });
    }
  }

  // Message to Server

  @SubscribeMessage('sendMsgFromStudent')
  async msgFromStudent(
    @MessageBody() { data: { to, msg } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.headers.authorization.split(' ')[1];

    const { id: from } = await this.tokenService.verifyStudentToken(token);
    const {
      status,
      data: { senderId, receiverId, message },
    } = await this.conversationService.msgFromStudent(from, to, msg);

    if (status === CHAT_STATUS.PENDING) {
      client.broadcast.to(client.id).emit('pending', 'PENDING');
    }

    if (status === CHAT_STATUS.REJECTED) {
      client.broadcast.to(client.id).emit('rejected', 'REJECTED');
    }

    if (status === CHAT_STATUS.ACCEPTED) {
      this.logger.log({ to, msg });
      let receriverId = this.chat.get(to);
      if (receriverId) {
        receriverId.forEach((id: string) => {
          client.broadcast.to(id).emit('reveiveMsgFromStudent', {
            studentId: senderId,
            tutorId: receiverId,
            msg: message,
          });
        });
      }
    }
  }

  @SubscribeMessage('sendMsgFromTutor')
  async msgFromTutor(
    @MessageBody() { data: { to, msg } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.headers.authorization.split(' ')[1];
    const { id: from } = await this.tokenService.verifyTutorToken(token);
    const { data, status } = await this.conversationService.msgFromTutor(from, to, msg);
    if (status === CHAT_STATUS.ERROR) {
      client.broadcast.to(client.id).emit('error', 'ERROR');
    }
    if (status === CHAT_STATUS.ACCEPTED) {
      this.logger.log({ to, msg });
      let receriverId = this.chat.get(to);
      if (receriverId) {
        receriverId.forEach((id: string) => {
          client.broadcast.to(id).emit('reveiveMsgFromTutor', {
            tutorId: from,
            studentId: to,
            msg: data,
          });
        });
      }
    }
  }
}
