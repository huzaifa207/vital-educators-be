import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { resourceLinkTemplate } from 'src/mail-service/templates/email-resource';
import { PrismaService } from 'src/prisma-module/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService, private mailService: MailService) {}

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
        link: true,
      },
    });
    if (!resourceLink) return;

    try {
      this.mailService.sendMailSimple({
        email: email,
        emailContent: resourceLinkTemplate(resourceLink.link),
        subject: 'Resource Link',
        text: `Click here to access the resource ${resourceLink.link}`,
      });
    } catch (error) {
      console.log('email error - ', error);
      // throw new HttpException(error.message, 500);
    }

    return { message: 'success', success: true };
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
