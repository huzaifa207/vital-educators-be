import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackDto } from './create-feedback.dto';
import { ApprovalStatus } from '@prisma/client';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  comment: string;
}

export class ApproveFeedbackDto {
  status: ApprovalStatus;
}
