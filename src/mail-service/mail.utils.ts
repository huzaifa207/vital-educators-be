import { emailConfirm } from './templates/email-confirm';
import { emailFirstMessage } from './templates/email-first-message';
import { EmailReferee } from './templates/email-referee';
import { emailRemainder } from './templates/email-remainder';
import { passwordResetTemplate } from './templates/reset-password';

export enum EmailType {
  CONFIRM_EMAIL = 'CONFIRM_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  REFEREE_REVIEW = 'REFEREE_REVIEW',
  REMINDER = 'REMINDER',
  FIRST_MESSAGE = 'FIRST_MESSAGE',
  TUTOR_REPLY = 'TUTOR_REPLY',
}

export interface EmailParam {
  [EmailType.CONFIRM_EMAIL]: { name: string; url: string };
  [EmailType.RESET_PASSWORD]: { name: string; token: number };
  [EmailType.REFEREE_REVIEW]: { name: string; referee_name: string; url: string };
  [EmailType.REMINDER]: { name: string };
  [EmailType.FIRST_MESSAGE]: {
    web_url: string;
    name: string;
    country: string;
    profile_url: string;
  };
}

export interface IEmailTemplate {
  [EmailType.CONFIRM_EMAIL]: (data: EmailParam[EmailType.CONFIRM_EMAIL]) => string;
  [EmailType.RESET_PASSWORD]: (data: EmailParam[EmailType.RESET_PASSWORD]) => string;
  [EmailType.REFEREE_REVIEW]: (data: EmailParam[EmailType.REFEREE_REVIEW]) => string;
  [EmailType.REMINDER]: (data: EmailParam[EmailType.REMINDER]) => string;
  [EmailType.FIRST_MESSAGE]: (data: EmailParam[EmailType.FIRST_MESSAGE]) => string;
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
      [EmailType.CONFIRM_EMAIL]: (data: EmailParam[EmailType.CONFIRM_EMAIL]) =>
        emailConfirm(data.name, data.url),

      [EmailType.RESET_PASSWORD]: (data: EmailParam[EmailType.RESET_PASSWORD]) =>
        passwordResetTemplate(data.name, data.token),

      [EmailType.REFEREE_REVIEW]: (data: EmailParam[EmailType.REFEREE_REVIEW]) =>
        EmailReferee(data.name, data.referee_name, data.url),

      [EmailType.REMINDER]: (data: EmailParam[EmailType.REMINDER]) => emailRemainder(data.name),

      [EmailType.FIRST_MESSAGE]: (data: EmailParam[EmailType.FIRST_MESSAGE]) =>
        emailFirstMessage(data.name, data.country, data.profile_url, data.web_url),
    };
  }
  abstract renderTemplate(): string;
}

export class EmailUtility extends GenericMail {
  constructor(
    public data: {
      email: string;
      name?: string;
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
        name: this.data.name,
        url: `https://api.vitaleducators.com/user/confirm-email/${this.data.token as string}`,
      });
    }

    if (this.data.action === EmailType.RESET_PASSWORD) {
      const passTemp = this.templates[EmailType.RESET_PASSWORD];
      return passTemp({ name: this.data.name, token: +this.data.token });
    }

    if (this.data.action === EmailType.REFEREE_REVIEW) {
      const refereeTemp = this.templates[EmailType.REFEREE_REVIEW];
      return refereeTemp({
        name: this.data.name,
        referee_name: this.data.other.referee_name as string,
        url: `${this.domain}referee-review?t=${this.data.token}` as string,
      });
    }

    if (this.data.action === EmailType.REMINDER) {
      const reminderTemp = this.templates[EmailType.REMINDER];
      return reminderTemp({
        name: this.data.name,
      });
    }

    if (
      this.data.action === EmailType.FIRST_MESSAGE ||
      this.data.action === EmailType.TUTOR_REPLY
    ) {
      const firstMessageTemp = this.templates[EmailType.FIRST_MESSAGE];
      return firstMessageTemp({
        name: this.data.name,
        country: this.data.other.country as string,
        profile_url: this.data.other.profile_url as string,
        web_url: this.data.other.web_url as string,
      });
    }
  };
}
