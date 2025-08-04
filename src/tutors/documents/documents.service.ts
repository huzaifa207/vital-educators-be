import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AlertsService } from 'src/alerts/alerts.service';
import { PrismaService } from 'src/prisma-module/prisma.service';

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
      console.log(error);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  findOne(tutorId: number) {
    try {
      return this.prisma.documents.findUnique({
        where: { tutorId },
      });
    } catch (error) {
      throw new NotFoundException("Document doesn't exist");
    }
  }

  async update(tutorId: number, updateDocumentDto: Prisma.DocumentsUpdateInput) {
    try {
      const t = await this.prisma.documents.update({
        where: { tutorId },
        data: updateDocumentDto,
      });

      const tutor = await this.prisma.tutor.findUnique({
        where: { id: tutorId },
        select: { userId: true },
      });

      if (tutor) {
        this.alertService.dispatchDocUpdated(tutor.userId);
      }

      return t;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Please send a valid data');
      }
      console.log(error);
      throw new BadRequestException('Tutor not found');
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
