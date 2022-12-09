import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FlaggedMessagesModule } from 'src/flagged-messages/flagged-messages.module';
import { FlaggedMessagesService } from 'src/flagged-messages/flagged-messages.service';
import { MailModule } from 'src/mail-service/mail.module';
import { ENV } from 'src/settings';
import { StudentsModule } from 'src/students/students.module';
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
    StudentsModule,
    TokenModule,
    UsersModule,
    MailModule,
    TaskSchadularsModule,
    FlaggedMessagesModule,
  ],
  providers: [ChatsGateway, ConversationService, TokenService],
})
export class ChatsModule {}
