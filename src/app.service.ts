import { Injectable } from '@nestjs/common';
import { TaskSchadularsService } from './task-schadulars/task-schadulars.service';

@Injectable()
export class AppService {
  constructor(private taskSchadularsService: TaskSchadularsService) {}

  async createUser(user: { email: string; password: string }) {
    try {
      // console.log('user', user);
      // this.taskSchadularsService.emitt(user);
      return 'success';
    } catch (error) {
      console.log(error);
    }
  }
}
