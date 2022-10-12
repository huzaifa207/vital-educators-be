import { Expose, Type } from 'class-transformer';

export class ReturnUserDto {
  @Expose()
  id: number;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;

  @Expose()
  profile_url: string;

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
  search_visibility: boolean;

  @Expose()
  promotion_vital_educator: boolean;

  @Expose()
  promotion_third_parties: boolean;

  @Expose()
  email_approved: boolean;

  @Expose()
  role: string;

  @Expose()
  created_at: Date;
  @Expose()
  block_status: boolean;
  @Expose()
  block_reason: string;

  @Expose()
  updated_at: Date;
}

export class AllUsersDTO {
  @Expose()
  @Type(() => ReturnUserDto)
  users: ReturnUserDto[];
  @Expose()
  total: number;
}
