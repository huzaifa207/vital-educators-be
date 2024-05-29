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

  async getResources() {
    const resources = await this.prisma.resources.findMany();
    return resources;
  }

  async subscribe(data: Prisma.SubscriptionsCreateInput) {
    const subscription = await this.prisma.subscriptions.create({
      data,
    });
    return subscription;
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
          const result = await this.mailService.sendMailSimple({
            email: email,
            emailContent: resourceLinkTemplate(signedUrl, resourceLink.subject),
            subject: 'Resource Link',
            text: `Click here to access the resource ${signedUrl}`,
          });
          if (result) {
            try {
              const exists = await this.prisma.subscriptions.findUnique({
                where: {
                  email,
                },
              });
              if (exists) return { message: 'success', success: true, signedUrl, subscribed: true };
              else {
                const subscribed = await this.subscribe({ email });
                if (subscribed)
                  return { message: 'success', success: true, signedUrl, subscribed: true };
              }
            } catch (error) {
              console.log('Subscription error: ', error);
              return { message: 'success', success: true, signedUrl, subscribed: false };
            }
          }
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
