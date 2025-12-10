import { Injectable } from '@nestjs/common';
import { ApprovalStatus, Role } from '@prisma/client';
import { FlaggedMessagesService } from 'src/flagged-messages/flagged-messages.service';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { UpdateDocumentStatusDto } from '../tutors/documents/dto/update-document-status.dto';
import { TutorsService } from '../tutors/tutors.service';
import { DocumentsService } from '../tutors/documents/documents.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tutorService: TutorsService,
    private readonly documentsService: DocumentsService,
    private readonly usersService: UsersService,
  ) {}

  async getStats() {
    const tutorsCount = await this.prisma.user.count({
      where: {
        role: Role.TUTOR,
      },
    });
    const studentsCount = await this.prisma.user.count({
      where: {
        role: Role.STUDENT,
      },
    });
    const flaggedMessagesCount = await this.prisma.flaggedMessage.count();
    return {
      tutorsCount,
      studentsCount,
      flaggedMessagesCount: flaggedMessagesCount,
    };
  }

  async updateDocumentStatus(data: UpdateDocumentStatusDto) {

    const { userId } = await this.tutorService.getUserIdByTutorId(data.tutorId);

    if (!userId) return;

    const updatedDocumentStatus = await this.tutorService.updateDocumentStatus(data.tutorId, {
      status: data.status,
      rejection_reason: data.rejection_reason,
    });

    let updatedUser = null;

    if (
      data.status === ApprovalStatus.APPROVED &&
      (data.requested_first_name || data.requested_last_name)
    ) {
      const updateData: any = {};

      if (data.requested_first_name) {
        updateData.first_name = data.requested_first_name;
        updateData.requestedFirstName = null;
      }

      if (data.requested_last_name) {
        updateData.last_name = data.requested_last_name;
        updateData.requestedLastName = null;
      }

      updatedUser = await this.usersService.update(userId, updateData);
    }

    return { updatedDocumentStatus, updatedUser };
  }
}
