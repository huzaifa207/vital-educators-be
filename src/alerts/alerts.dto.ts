import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreateAlertDTO {
  @IsString()
  @MinLength(3)
  description: string;

  @IsString()
  @IsUrl()
  actionURL: string;
}
