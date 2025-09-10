import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ApprovalStatus } from '@prisma/client';
import { AlertsService } from 'src/alerts/alerts.service';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService, private alertService: AlertsService) {}

  async create(createDocumentDto: Prisma.DocumentsCreateInput, tutorId: number) {
    try {
      const document = await this.prisma.documents.create({
        data: {
          ...createDocumentDto,
          tutor: { connect: { id: tutorId } },
        },
      });
      return document;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async findOne(tutorId: number) {
    try {
      return this.prisma.documents.findUnique({
        where: { tutorId },
      });
    } catch (error) {
      throw new NotFoundException("Document doesn't exist");
    }
  }

  async getApprovedDocuments(tutorId: number) {
    try {
      const documents = await this.prisma.documents.findUnique({
        where: { tutorId },
        select: {
          approved_passport_url: true,
          approved_license_url: true,
          approved_criminal_record_url: true,
        },
      });

      if (!documents) {
        return {
          passport_url: '',
          license_url: '',
          criminal_record_url: '',
        };
      }

      return {
        passport_url: documents.approved_passport_url || '',
        license_url: documents.approved_license_url || '',
        criminal_record_url: documents.approved_criminal_record_url || '',
      };
    } catch (error) {
      throw new NotFoundException("Document doesn't exist");
    }
  }

  async update(tutorId: number, updateDocumentDto: UpdateDocumentDto) {
    try {
      const updateData: any = { ...updateDocumentDto };
      updateData.status = ApprovalStatus.PENDING;

      const updatedDocument = await this.prisma.documents.upsert({
        where: { tutorId },
        update: updateData,
        create: {
          tutorId,
          ...updateData,
        },
      });

      const tutor = await this.prisma.tutor.findUnique({
        where: { id: tutorId },
        select: { userId: true },
      });

      if (tutor) {
        await this.alertService.dispatchDocUpdated(tutor.userId);
      }

      return updatedDocument;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send valid data');
      }

      throw new BadRequestException('Failed to update document');
    }
  }

  async updateDocumentStatus(tutorId: number, statusUpdates: any) {
    try {
      const currentDocument = await this.prisma.documents.findUnique({
        where: { tutorId },
      });

      const updateData = { ...statusUpdates };

      if (statusUpdates.status === ApprovalStatus.APPROVED) {
        if (currentDocument.passport_url) {
          updateData.approved_passport_url = currentDocument.passport_url;
          updateData.passport_url = '';
        }

        if (currentDocument.license_url) {
          updateData.approved_license_url = currentDocument.license_url;
          updateData.license_url = '';
        }

        if (currentDocument.criminal_record_url) {
          updateData.approved_criminal_record_url = currentDocument.criminal_record_url;
          updateData.criminal_record_url = '';
        }
      }

      const updatedDocument = await this.prisma.documents.update({
        where: { tutorId },
        data: updateData,
      });

      const tutor = await this.prisma.tutor.findUnique({
        where: { id: tutorId },
        select: { userId: true },
      });

      if (tutor) {
        this.alertService.dispatchDocUpdated(tutor.userId);
      }

      return updatedDocument;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send valid status data');
      }

      throw new BadRequestException('Failed to update document status');
    }
  }

  async remove(tutorId: number) {
    try {
      await this.prisma.documents.delete({
        where: { tutorId },
      });
      return 'Document deleted successfully';
    } catch (error) {
      throw new NotFoundException("Document doesn't exist");
    }
  }
}
