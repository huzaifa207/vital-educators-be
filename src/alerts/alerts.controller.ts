import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { CreateAlertDTO } from './alerts.dto';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}
  @UseGuards(AdminGuard)
  @Get()
  async getAll(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.alertsService.getAll({ offset: queryOffset, limit: queryLimit });
    return res;
  }
  @UseGuards(AdminGuard)
  @Post()
  async createNew(@Body() body: CreateAlertDTO) {
    return { id: (await this.alertsService.create(body)).id };
  }
}
