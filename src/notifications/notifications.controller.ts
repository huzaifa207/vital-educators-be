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
  Req,
} from '@nestjs/common';
import { NotificationRole, NotificationTargetType, Prisma } from '@prisma/client';
import { Request } from 'express';
import { Serializer } from 'src/interceptors/serialized.interceptor';
import { MailService } from 'src/mail-service/mail.service';
import { emailAnnouncement } from 'src/mail-service/templates/email-announcement';
import { emailNotification } from 'src/mail-service/templates/email-notification';
import { UsersService } from 'src/users/users.service';
import {
  CreateUserNotificationDTO,
  CreateGlobalNotificationDTO,
  GlobalNotificationResponseDTO,
  UserNotificationResponseDTO,
} from './notifications.dto';
import { NotificationService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
  ) {}

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

  @Serializer(GlobalNotificationResponseDTO)
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
  @Serializer(GlobalNotificationResponseDTO)
  @Get('/archived')
  async getAllArchvied(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.notificationService.getArchived({
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
  @Serializer(UserNotificationResponseDTO)
  @Get('/user/:userId')
  async getAllUserNotifs(
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
  @Serializer(UserNotificationResponseDTO)
  @Get('/user')
  async getCurrentUserNotifs(
    @Req() req: Request,
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const user = req.currentUser as any;
    const res = await this.notificationService.getUser(user.id, {
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
      const notif = await this.notificationService.create({
        ...body,
        targetType: NotificationTargetType.GLOBAL,
      });

      try {
        const users = await this.userService.findAll({ role: body.role });
        for (const user of users) {
          try {
            this.mailService.sendMailSimple({
              email: user.email,
              text: 'New Announcement from Admin',
              subject: 'New Announcement',
              emailContent: emailAnnouncement(body.title, body.description),
            });
          } catch (er) {
            console.warn(er);
          }
        }
      } catch (er) {
        console.warn(er);
      }

      return {
        id: notif.id,
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
      const notif = await this.notificationService.create({
        ...body,
        targetType: NotificationTargetType.USER,
        target: { connect: { id: userId } },
      });

      try {
        const user = await this.userService.findOne(userId);
        if (user) {
          this.mailService.sendMailSimple({
            email: user.email,
            text: "You've a new notification",
            subject: 'New Notification',
            emailContent: emailNotification(body.title, body.description),
          });
        }
      } catch (er) {
        console.warn(er);
      }
      return {
        id: notif.id,
      };
    } catch (er) {
      console.warn(er);
      throw new BadRequestException('failed to create user notification');
    }
  }
}
