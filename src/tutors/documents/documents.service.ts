import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Exception } from 'handlebars';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}
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
      throw new ConflictException('Document already exists');
    }
  }

  findOne(tutorId: number) {
    try {
      return this.prisma.documents.findUnique({
        where: { tutorId },
      });
    } catch (error) {
      throw new Exception("Document doesn't exist");
    }
  }

  update(tutorId: number, updateDocumentDto: Prisma.DocumentsUpdateInput) {
    try {
      return this.prisma.documents.update({
        where: { tutorId },
        data: updateDocumentDto,
      });
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
      throw new Exception("Document doesn't exist");
    }
  }
}
