import { CHAT_STATUS } from './conversation.service';

export interface IChat {
  studentId: number;
  tutorId: number;
  msg: string;
  status: CHAT_STATUS;
}
