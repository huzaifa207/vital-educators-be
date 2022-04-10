import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, username: string, token: string) {
    const url = 'http://localhost:3000/user/confirm-email/' + token;
    console.log('url = ', url);
    await this.mailerService.sendMail({
      to: email,
      text: 'This is from VitalEducators',
      subject: 'Welcome to Vital Educators! Confirm your email',
      template: '/email-confirmation',
      context: {
        username,
        url,
      },
    });
  }

  async sendResetPasswordEmail(email: string, username: string, token: string) {
    const url = 'http://localhost:3000/user/reset-password/' + token;
    console.log('url = ', url);
    await this.mailerService.sendMail({
      to: email,
      text: 'This is from VitalEducators',
      subject: 'Reset your password',
      template: '/reset-password',
      context: {
        username,
        url,
      },
    });
  }
}
