import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskSchadularsService } from './task-schadulars.service';

@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [],
  providers: [TaskSchadularsService],
  exports: [TaskSchadularsService],
})
export class TaskSchadularsModule {}
