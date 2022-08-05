import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationTargetType, Prisma } from '@prisma/client';
import { Serializer } from 'src/interceptors/serialized.interceptor';
import { CreateNotificationDTO, NotificationResponseDTO } from './notifications.dto';
import { NotificationService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAll(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.notificationService.getAll({ offset: queryOffset, limit: queryLimit });
    return {
      length: res.length,
      offset: queryOffset,
      limit: queryLimit,
      notifications: res,
    };
  }

  @Serializer(NotificationResponseDTO)
  @Get('/global')
  async getAllGlobal(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.notificationService.getGlobal({
      offset: queryOffset,
      limit: queryLimit,
    });
    return {
      length: await res.length,
      offset: queryOffset,
      limit: queryLimit,
      notifications: res,
    };
  }
  @Serializer(NotificationResponseDTO)
  @Get('/user/:userId')
  async getAllUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.notificationService.getUser(userId, {
      offset: queryOffset,
      limit: queryLimit,
    });
    return {
      length: await res.length,
      offset: queryOffset,
      limit: queryLimit,
      notifications: res,
    };
  }

  @Post('/global')
  async createNewGlobal(@Body() body: CreateNotificationDTO) {
    return {
      id: (
        await this.notificationService.create({
          ...body,
          targetType: NotificationTargetType.GLOBAL,
        })
      ).id,
    };
  }
  @Post('/user/:userId')
  async createNewUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Body() body: CreateNotificationDTO,
  ) {
    return {
      id: (
        await this.notificationService.create({
          ...body,
          targetType: NotificationTargetType.USER,
          target: { connect: { id: userId } },
        })
      ).id,
    };
  }
}
