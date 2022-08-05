import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationRole, NotificationTargetType, Prisma } from '@prisma/client';
import { Serializer } from 'src/interceptors/serialized.interceptor';
import {
  CreateUserNotificationDTO,
  CreateGlobalNotificationDTO,
  NotificationResponseDTO,
} from './notifications.dto';
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

  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId', new ParseIntPipe()) notificationId: number) {
    try {
      await this.notificationService.deleteOne(notificationId);
      return {
        deleted: true,
      };
    } catch (er) {
      throw new BadRequestException('failed to delete notification with id' + notificationId);
    }
  }

  @Serializer(NotificationResponseDTO)
  @Get('/global')
  async getAllGlobal(
    @Query('role') queryRole: string,
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    let role: NotificationRole | undefined = undefined;

    if (queryRole) {
      queryRole = queryRole.toUpperCase();
      if (Object.values(NotificationRole).includes(queryRole as any))
        role = queryRole as NotificationRole;
      else
        throw new BadRequestException(
          "Invalid value for 'role'. Possible values are " +
            Object.values(NotificationRole).join(', '),
        );
    }
    const res = await this.notificationService.getGlobal(role, {
      offset: queryOffset,
      limit: queryLimit,
    });
    return {
      length: res.length,
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
      length: res.length,
      offset: queryOffset,
      limit: queryLimit,
      notifications: res,
    };
  }

  @Post('/global')
  async createNewGlobal(@Body() body: CreateGlobalNotificationDTO) {
    try {
      body.role = body.role.toUpperCase() as NotificationRole;
      return {
        id: (
          await this.notificationService.create({
            ...body,
            targetType: NotificationTargetType.GLOBAL,
          })
        ).id,
      };
    } catch (er) {
      console.warn(er);
      throw new BadRequestException('failed to create global notification');
    }
  }
  @Post('/user/:userId')
  async createNewUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Body() body: CreateUserNotificationDTO,
  ) {
    try {
      return {
        id: (
          await this.notificationService.create({
            ...body,
            targetType: NotificationTargetType.USER,
            target: { connect: { id: userId } },
          })
        ).id,
      };
    } catch (er) {
      console.warn(er);
      throw new BadRequestException('failed to create user notification');
    }
  }
}
