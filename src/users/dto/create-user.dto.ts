import { IsEmail, IsString } from 'class-validator';

export enum Role {
  STUDENT,
  TUTOR,
  ADMIN,
}

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  address_1: string;

  @IsString()
  address_2: string;

  @IsString()
  phone: string;

  @IsString()
  country: string;

  @IsString()
  postal_code: string;
}
