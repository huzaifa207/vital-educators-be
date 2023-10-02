import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { GenericMail } from './mail.utils';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail({ email, subject, renderTemplate }: GenericMail) {
    try {
      await this.mailerService.sendMail({
        to: email,
        text: 'This is from VitalEducators',
        subject: subject,
        html: renderTemplate(),
      });
    } catch (error) {
      console.log('email error - ', error);
      // throw new HttpException(error.message, 500);
    }
  }
  async sendMailSimple({
    email,
    text,
    subject,
    emailContent,
  }: {
    email: string;
    text: string;
    subject: string;
    emailContent: string;
  }) {
    try {
      const result = await this.mailerService.sendMail({
        to: email,
        text: text,
        subject: subject,
        html: emailContent,
      });
      return result;
    } catch (error) {
      console.log('email error - ', error);
      // throw new HttpException(error.message, 500);
    }
  }
}
