import { emailConfirm } from './templates/email-confirm';
import { passwordResetTemplate } from './templates/reset-password';

const domain = 'http://vital-educator.herokuapp.com/';

export enum EmailType {
  CONFIRM_EMAIL = 'CONFIRM_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface EmailParam {
  [EmailType.CONFIRM_EMAIL]: { username: string; url: string };
  [EmailType.RESET_PASSWORD]: { username: string; token: number };
}

export interface IEmailTemplate {
  [EmailType.CONFIRM_EMAIL]: (data: EmailParam['CONFIRM_EMAIL']) => string;
  [EmailType.RESET_PASSWORD]: (data: EmailParam['RESET_PASSWORD']) => string;
}

export abstract class GenericMail {
  email: string;
  subject: string;
  domain: string;
  templates: IEmailTemplate;

  constructor(email: string) {
    this.email = email;
    this.subject = 'Confirm your email';
    this.domain = 'http://vital-educator.herokuapp.com/';

    this.templates = {
      [EmailType.CONFIRM_EMAIL]: (data: EmailParam['CONFIRM_EMAIL']) =>
        emailConfirm(data.username, data.url),

      [EmailType.RESET_PASSWORD]: (data: EmailParam['RESET_PASSWORD']) =>
        passwordResetTemplate(data.username, data.token),
    };
  }
  abstract renderTemplate(): string;
}

export class EmailUtility extends GenericMail {
  constructor(
    public data: {
      email: string;
      username?: string;
      token?: number;
      action: EmailType;
    },
  ) {
    super(data.email);
  }

  renderTemplate = () => {
    if (this.data.action === EmailType.CONFIRM_EMAIL) {
      const emailTemp = this.templates[EmailType.CONFIRM_EMAIL];
      return emailTemp({
        username: this.data.username,
        url: `${this.domain}/confirm-email/${this.data.token}`,
      });
    }

    if (this.data.action === EmailType.RESET_PASSWORD) {
      const passTemp = this.templates[EmailType.RESET_PASSWORD];
      return passTemp({ username: this.data.username, token: this.data.token });
    }
  };
}
