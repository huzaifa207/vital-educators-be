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
import { ChatsService } from './chats.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatsService: ChatsService,
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
    // const { id } = await this.tokenService.verifyToken(token);
    const alreadyConnected = this.chat.get(token);

    if (alreadyConnected) {
      alreadyConnected.push(client.id);
    } else {
      this.chat.set(token, [client.id]);
    }

    this.inc += 1;
  }

  // Message to Server
  @SubscribeMessage('createChat')
  create(
    @MessageBody() { data: { to, from, msg } }: { data: IChat },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log({ to, from, msg });
    let receriverId = this.chat.get(to);
    if (receriverId) {
      receriverId.forEach((id: string) => {
        client.broadcast.to(id).emit('reveiveMsg', { to, from, msg });
      });
    }
  }

  add(chat: IChat) {
    // this.chat.push({ msg: chat.msg, to: chat.to, from: chat.from });
  }

  @SubscribeMessage('findAllChats')
  findAll() {
    return this.chatsService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatsService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatsService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatsService.remove(id);
  }
}
