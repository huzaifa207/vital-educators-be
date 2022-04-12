export interface IChat {
  msg: string;
  to: string;
  from: string;
}
export class Chat {
  constructor(public chatList: IChat[] = []) {}

  public show(): IChat[] {
    return this.chatList;
  }
  public add(chat: IChat) {
    this.chatList.push({ msg: chat.msg, to: chat.to, from: chat.from });
  }
}
