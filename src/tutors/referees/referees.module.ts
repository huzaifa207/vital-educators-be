import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailModule } from 'src/mail-service/mail.module';
import { MailService } from 'src/mail-service/mail.service';
import { PrismaService } from 'src/prisma.service';
import { ENV } from 'src/settings';
import { RefereesController } from './referees.controller';
import { RefereesService } from './referees.service';

@Module({
  imports: [
    JwtModule.register({
      secret: ENV['JWT_SECRET'],
    }),
    MailModule,
  ],
  controllers: [RefereesController],
  providers: [PrismaService, RefereesService, MailService, AlertsService],
  exports: [RefereesService],
})
export class RefereesModule {}
