import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';
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
      throw new HttpException(error.message, 500);
    }
  }
}
