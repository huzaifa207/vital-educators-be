import { IsString, IsOptional, IsUrl } from 'class-validator';

export class RequestUpdateApprovalDto {
  @IsOptional()
  @IsUrl({}, { message: 'passport_url must be a valid URL' })
  passport_url: string;
  @IsOptional()
  @IsUrl({}, { message: 'license_url must be a valid URL' })
  license_url: string;
  @IsOptional()
  @IsUrl({}, { message: 'criminal_record_url must be a valid URL' })
  criminal_record_url: string;

  @IsOptional()
  @IsString({ message: 'first_name must be a string' })
  first_name?: string;

  @IsOptional()
  @IsString({ message: 'last_name must be a string' })
  last_name?: string;
}
