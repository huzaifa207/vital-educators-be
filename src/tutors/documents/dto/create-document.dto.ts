import { ApprovalStatus } from '@prisma/client';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  passport_url?: string;

  @IsOptional()
  @IsString()
  license_url?: string;

  @IsOptional()
  @IsString()
  criminal_record_url?: string;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
