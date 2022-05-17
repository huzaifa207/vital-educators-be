import { CHAT_STATUS } from './conversation.service';
export interface IChat {
  receiverId: number;
  msg: string;
}

export interface IChatReturn {
  id: number;
  tutorId: number;
  studentId: number;
  msg: string;
  status: CHAT_STATUS;
}
