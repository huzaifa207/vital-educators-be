import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateNotificationDTO {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;
}

class ReturnNotificationDTO {
  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: string;
}
class PaginationDTO {
  @Expose()
  limit: number;
  @Expose()
  offset: number;
  @Expose()
  length: number;
}
export class NotificationResponseDTO extends PaginationDTO {
  @Expose()
  @Type(() => ReturnNotificationDTO)
  notifications: Array<ReturnNotificationDTO>;
}
