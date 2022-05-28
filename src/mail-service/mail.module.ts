import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV } from 'src/settings';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        transport: {
          host: ENV['SMTP_HOST'],
          port: ENV['EMAIL_PORT'],
          secure: false,
          auth: {
            user: ENV['EMAIL_USER'],
            pass: ENV['EMAIL_PASSWORD'],
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: ENV['EMAIL_FROM'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
