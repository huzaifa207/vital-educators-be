import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectOfferDto } from './create-subject-offer.dto';

export class UpdateSubjectOfferDto extends PartialType(CreateSubjectOfferDto) {}
