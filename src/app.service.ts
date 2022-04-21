import { Injectable } from '@nestjs/common';
import { TaskSchadularsService } from './task-schadulars/task-schadulars.service';
import { UserDto } from './userDto';

@Injectable()
export class AppService {
  constructor(private taskSchadularsService: TaskSchadularsService) {}

  async createUser(user: UserDto) {
    try {
      this.taskSchadularsService.emitt(user);
      return 'success';
    } catch (error) {
      console.log(error);
    }
  }
}
