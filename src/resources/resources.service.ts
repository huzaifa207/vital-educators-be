import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { resourceLinkTemplate } from 'src/mail-service/templates/email-resource';
import { FileService } from 'src/media/file.service';
import { PrismaService } from 'src/prisma-module/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
    private FileService: FileService,
  ) {}

  async createResource(data: Prisma.ResourcesCreateInput) {
    const resource = await this.prisma.resources.create({
      data,
    });
    return resource;
  }

  async getResouces() {
    const resources = await this.prisma.resources.findMany();
    return resources;
  }

  async sendLinkToEmail({ email, id }: { email: string; id: string }) {
    const resourceLink = await this.prisma.resources.findUnique({
      where: {
        id: parseInt(id),
      },

      select: {
        resourceS3Key: true,
        subject: true,
      },
    });
    if (!resourceLink) return;

    if (!resourceLink.resourceS3Key) return { message: 'failed', success: false };

    try {
      const signedUrl = await this.FileService.getFileUrl(resourceLink.resourceS3Key);
      if (signedUrl) {
        try {
          await this.mailService.sendMailSimple({
            email: email,
            emailContent: resourceLinkTemplate(signedUrl, resourceLink.subject),
            subject: 'Resource Link',
            text: `Click here to access the resource ${signedUrl}`,
          });
          return { message: 'success', success: true };
        } catch (error) {
          console.log('email error - ', error);
          return { message: 'failed', success: false };
        }
      }
    } catch (error) {
      console.log('signedUrl error - ', error);
      return { message: 'failed', success: false };
    }
  }

  async deleteResource({ id }: { id: string }) {
    const resource = await this.prisma.resources.delete({
      where: {
        id: parseInt(id),
      },
    });
    return resource;
  }

  async updateResource({ id, data }: { id: string; data: Prisma.ResourcesUpdateInput }) {
    const resource = await this.prisma.resources.update({
      where: {
        id: parseInt(id),
      },
      data,
    });
    return resource;
  }
}
