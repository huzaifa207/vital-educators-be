import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail-service/mail.module';
import { PrismaService } from 'src/prisma.service';
import { ENV } from 'src/settings';
import { TaskSchadularsModule } from 'src/task-schadulars/task-schadulars.module';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { UsersModule } from 'src/users/users.module';
import { ChatsGateway } from './chats.gateway';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    JwtModule.register({
      secret: ENV['JWT_SECRET'],
    }),
    TokenModule,
    UsersModule,
    MailModule,
    TaskSchadularsModule,
  ],
  providers: [ChatsGateway, ConversationService, TokenService, PrismaService],
})
export class ChatsModule {}
