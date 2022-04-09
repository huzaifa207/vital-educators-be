import { Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ReturnUserDto {
  @Expose()
  id: number;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @IsEmail()
  email: string;

  @Expose()
  username: string;

  @Expose()
  address_1: string;

  @Expose()
  address_2: string;

  @Expose()
  phone: string;

  @Expose()
  country: string;

  @Expose()
  postal_code: string;

  @Expose()
  email_approved: boolean;

  @Expose()
  role: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
