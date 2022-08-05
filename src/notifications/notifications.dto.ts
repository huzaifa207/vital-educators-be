import { NotificationRole, NotificationTargetType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { IsIn, IsString, MinLength } from 'class-validator';

export class CreateUserNotificationDTO {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;
}

export class CreateGlobalNotificationDTO {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsIn(Object.values(NotificationRole))
  role: NotificationRole;
}

class ReturnUserNotificationDTO {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: string;
}

class ReturnGlobalNotificationDTO extends ReturnUserNotificationDTO {
  @Expose()
  role: string;
}
class PaginationDTO {
  @Expose()
  limit: number;
  @Expose()
  offset: number;
  @Expose()
  length: number;
}
export class UserNotificationResponseDTO extends PaginationDTO {
  @Expose()
  @Type(() => ReturnUserNotificationDTO)
  notifications: Array<ReturnUserNotificationDTO>;
}
export class GlobalNotificationResponseDTO extends PaginationDTO {
  @Expose()
  @Type(() => ReturnGlobalNotificationDTO)
  notifications: Array<ReturnGlobalNotificationDTO>;
}
