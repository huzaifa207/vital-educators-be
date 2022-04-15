import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IChat } from './chat';
import { ChatsService } from './chats.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatsService: ChatsService) {}
  public chat = [];

  private logger: Logger = new Logger('StudentGateway');

  afterInit(server: Server) {
    this.logger.log('Student Gateway Initialize!');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client DisConnected: ', client.id);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client: ', client.handshake.headers.authorization);
    this.logger.log('Client Connected: ', client.id);
  }

  // Message to Server
  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: IChat): WsResponse<Object> {
    this.add(createChatDto);
    return {
      event: 'msToClient',
      data: createChatDto,
    };
  }

  add(chat: IChat) {
    this.chat.push({ msg: chat.msg, to: chat.to, from: chat.from });
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
