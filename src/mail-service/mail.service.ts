import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { GenericMail } from './mail.utils';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail({ email, subject, renderTemplate }: GenericMail) {
    await this.mailerService.sendMail({
      to: email,
      text: 'This is from VitalEducators',
      subject: subject,
      html: renderTemplate(),
    });
  }
}
