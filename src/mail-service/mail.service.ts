import { Injectable } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';
import { ENV } from 'src/settings';
import { GenericMail } from './mail.utils';

@Injectable()
export class MailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, ENV.BREVO_API_KEY);
  }

  async sendMail({ email, subject, renderTemplate }: GenericMail) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = renderTemplate();
    sendSmtpEmail.sender = {
      name: 'VitalEducators',
      email: ENV.EMAIL_FROM,
    };
    sendSmtpEmail.to = [{ email: email }];

    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully:', result.response.statusCode);
      return result;
    } catch (error) {
      console.log('Brevo email error:', error);
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
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = emailContent;
    sendSmtpEmail.textContent = text;
    sendSmtpEmail.sender = {
      name: 'VitalEducators',
      email: ENV.EMAIL_FROM,
    };
    sendSmtpEmail.to = [{ email: email }];

    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return result;
    } catch (error) {
      console.log('Brevo email error:', error);
    }
  }
}
