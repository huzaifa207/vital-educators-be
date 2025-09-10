import { ApprovalStatus } from '@prisma/client';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';

export class UpdateDocumentStatusDto {
  @IsNumber()
  tutorId: number;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @IsOptional()
  @IsString()
  requested_first_name?: string;

  @IsOptional()
  @IsString()
  requested_last_name?: string;
}
