import { emailConfirm } from './templates/email-confirm';
import { EmailReferee } from './templates/email-referee';
import { passwordResetTemplate } from './templates/reset-password';

export enum EmailType {
  CONFIRM_EMAIL = 'CONFIRM_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  REFEREE_REVIEW = 'REFEREE_REVIEW',
}

export interface EmailParam {
  [EmailType.CONFIRM_EMAIL]: { username: string; url: string };
  [EmailType.RESET_PASSWORD]: { username: string; token: number };
  [EmailType.REFEREE_REVIEW]: { username: string; referee_name: string; url: string };
}

export interface IEmailTemplate {
  [EmailType.CONFIRM_EMAIL]: (data: EmailParam['CONFIRM_EMAIL']) => string;
  [EmailType.RESET_PASSWORD]: (data: EmailParam['RESET_PASSWORD']) => string;
  [EmailType.REFEREE_REVIEW]: (data: EmailParam['REFEREE_REVIEW']) => string;
}

export abstract class GenericMail {
  email: string;
  subject: string;
  domain: string;
  templates: IEmailTemplate;

  constructor(email: string, subject: string) {
    this.email = email;
    this.subject = subject;
    this.domain = 'https://vital-educators.vercel.app/';

    this.templates = {
      [EmailType.CONFIRM_EMAIL]: (data: EmailParam['CONFIRM_EMAIL']) =>
        emailConfirm(data.username, data.url),

      [EmailType.RESET_PASSWORD]: (data: EmailParam['RESET_PASSWORD']) =>
        passwordResetTemplate(data.username, data.token),

      [EmailType.REFEREE_REVIEW]: (data: EmailParam['REFEREE_REVIEW']) =>
        EmailReferee(data.username, data.referee_name, data.url),
    };
  }
  abstract renderTemplate(): string;
}

export class EmailUtility extends GenericMail {
  constructor(
    public data: {
      email: string;
      username?: string;
      action: EmailType;
      token?: string | number;
      other?: { [key: string]: string | number };
    },
  ) {
    super(data.email, data.action.replace('_', ' '));
  }

  renderTemplate = () => {
    if (this.data.action === EmailType.CONFIRM_EMAIL) {
      const emailTemp = this.templates[EmailType.CONFIRM_EMAIL];
      return emailTemp({
        username: this.data.username,
        url: `${this.domain}email-verified/${this.data.token}`,
      });
    }

    if (this.data.action === EmailType.RESET_PASSWORD) {
      const passTemp = this.templates[EmailType.RESET_PASSWORD];
      return passTemp({ username: this.data.username, token: +this.data.token });
    }

    if (this.data.action === EmailType.REFEREE_REVIEW) {
      const refereeTemp = this.templates[EmailType.REFEREE_REVIEW];
      return refereeTemp({
        username: this.data.username,
        referee_name: this.data.other.referee_name as string,
        url: `${this.domain}referee-review?t=${this.data.token}` as string,
      });
    }
  };
}
