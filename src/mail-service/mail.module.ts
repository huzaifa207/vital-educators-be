import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailConfig } from './mail-config';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: MailConfig.SMTP_HOST,
          port: MailConfig.EMAIL_PORT,
          secure: false,
          auth: {
            user: MailConfig.EMAIL_USER,
            pass: MailConfig.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: MailConfig.EMAIL_FROM,
        },

        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
