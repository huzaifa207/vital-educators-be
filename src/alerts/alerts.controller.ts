import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateAlertDTO } from './alerts.dto';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}
  @Get()
  async getAll(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.alertsService.getAll({ offset: queryOffset, limit: queryLimit });
    return {
      length: res.length,
      offset: queryOffset,
      limit: queryLimit,
      alerts: res,
    };
  }

  @Post()
  async createNew(@Body() body: CreateAlertDTO) {
    return { id: (await this.alertsService.create(body)).id };
  }
}
