import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ENV } from 'src/settings';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { ChatsGateway } from './chats.gateway';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    JwtModule.register({
      secret: ENV['JWT_SECRET'],
    }),
    TokenModule,
  ],
  providers: [ChatsGateway, ConversationService, TokenService, PrismaService],
})
export class ChatsModule {}
