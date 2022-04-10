import { PartialType } from '@nestjs/mapped-types';
import { CreateTutoringDetailDto } from './create-tutoring-detail.dto';

export class UpdateTutoringDetailDto extends PartialType(CreateTutoringDetailDto) {}
