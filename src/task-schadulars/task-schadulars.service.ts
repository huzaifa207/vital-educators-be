import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { UserDto } from 'src/userDto';

@Injectable()
export class TaskSchadularsService {
  constructor(private schedulerRegistry: SchedulerRegistry, private eventEmitter: EventEmitter2) {}
  private readonly logger = new Logger('AppService');

  emitt(user: UserDto) {
    this.userCreatedSchedular(user);
  }

  userCreatedSchedular(user: UserDto) {
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, () => {
      this.logger.warn(`time to run! ${user.name}`);
    });

    this.schedulerRegistry.addCronJob(`${user.name}-${user.age}`, job);
    job.start();
  }
}
