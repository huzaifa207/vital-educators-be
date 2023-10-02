import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Post('/')
  async createResource(@Body() data: Omit<Prisma.ResourcesCreateInput, 'slug'>) {
    const slug = this.formatSlug(data.title, data.type, data.subject, data.level);
    const resource = await this.resourcesService.createResource({ ...data, slug });
    return resource;
  }

  @Get('/')
  async getResources() {
    const resources = await this.resourcesService.getResouces();

    const transformedData = {
      subject: [...new Set(resources.map((item) => item.subject))],
    };

    transformedData.subject.forEach((subj) => {
      transformedData[subj] = resources
        .filter((item) => item.subject === subj)
        .reduce((result, item) => {
          let { level, type, revisionType, title, id, fileType, resourceS3Key, link } = item as any;

          if (level === 'GCSE' || level === 'IGCSE') {
            level = 'GCSE_IGCSE';
            type = revisionType;
            if (resourceS3Key?.includes('/Topic Questions/')) revisionType = 'Topic Questions';
            else if (resourceS3Key?.includes('/Revision Notes/')) revisionType = 'Revision Notes';
            else revisionType = '';
          }

          if (!result[level]) {
            result[level] = {};
          }

          if (!result[level][type]) {
            result[level][type] = {};
          }

          let currentTarget = result[level][type];

          if (revisionType) {
            if (!currentTarget[revisionType]) {
              currentTarget[revisionType] = {};
            }
            currentTarget = currentTarget[revisionType];
          }

          if (!currentTarget.topic) {
            currentTarget.topic = [{ id, title }];
          } else {
            currentTarget.topic.push({
              id,
              title,
              fileType,
              resourceS3Key,
              link,
            });
          }

          return result;
        }, {});
    });
    return transformedData;
  }

  @Get('/admin')
  async getResourcesForAdmin() {
    const resources = await this.resourcesService.getResouces();
    return resources;
  }

  @Post('/request-link')
  async sendLinkToEmail(@Body() data: { email: string; id: string }) {
    const { email, id } = data;
    const resource = await this.resourcesService.sendLinkToEmail({ email, id });
    return resource;
  }

  @Delete('/:id')
  async deleteResource(@Param('id') id: string) {
    const resource = await this.resourcesService.deleteResource({ id });
    return resource;
  }

  @Patch('/:id')
  async updateResource(@Param('id') id: string, @Body() data: Prisma.ResourcesUpdateInput) {
    const resource = await this.resourcesService.updateResource({ id, data });
    return resource;
  }

  private formatSlug(title: string, type: string, subject: string, level: string) {
    return `${title.split(' ').join('-').toLocaleLowerCase()}-${type}-${subject
      .split(' ')
      .join('-')}-${level.toLowerCase()}`;
  }
}
