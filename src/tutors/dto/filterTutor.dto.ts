import { Expose } from 'class-transformer';
export class UserFilter {
  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

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
}

export class FilterTutorDto {
  @Expose()
  id: string;

  @Expose()
  skype_id: string;
}
