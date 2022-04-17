import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { emailConfirm } from './templates/email-confirm';
import { passwordResetTemplate } from './templates/reset-password';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  private domain = 'http://vital-educator.herokuapp.com/user/';
  async sendConfirmationEmail(email: string, username: string, token: string) {
    const url = this.domain + `confirm-email/${token}`;
    await this.mailerService.sendMail({
      to: email,
      text: 'This is from VitalEducators',
      subject: 'Welcome to Vital Educators! Confirm your email',
      html: emailConfirm(username, url),
    });
  }

  async sendResetPasswordEmail(email: string, username: string, token: number) {
    await this.mailerService.sendMail({
      to: email,
      text: 'This is from VitalEducators',
      subject: 'Reset your password',
      html: passwordResetTemplate(username, token),
    });
  }
}
