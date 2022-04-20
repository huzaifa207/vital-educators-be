import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail-service/mail.module';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaService } from 'src/prisma.service';
import { RefereesController } from './referees.controller';
import { RefereesService } from './referees.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MailModule,
  ],
  controllers: [RefereesController],
  providers: [PrismaService, RefereesService, MailService],
  exports: [RefereesService],
})
export class RefereesModule {}
