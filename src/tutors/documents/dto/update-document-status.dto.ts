import { ApprovalStatus } from '@prisma/client';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';

export class UpdateDocumentStatusDto {
  @IsNumber()
  tutorId: number;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  passport_status?: ApprovalStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  license_status?: ApprovalStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  criminal_record_status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  passport_rejection_reason?: string;

  @IsOptional()
  @IsString()
  license_rejection_reason?: string;

  @IsOptional()
  @IsString()
  criminal_record_rejection_reason?: string;
}
