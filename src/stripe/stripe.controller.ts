import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  InternalServerErrorException,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { StripeService } from './stripe.service';

@Controller('payment')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-subscription')
  async createSubscription() {
    try {
      const { id, secret } = await this.stripeService.createSubscription();
      return { id, secret };
      return;
    } catch (er) {
      console.warn(er);

      return new InternalServerErrorException();
    }
  }
  // @UseGuards(AdminGuard)
  // @Get()
  // async getAll(
  //   @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
  //   @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  // ) {
  //   const res = await this.alertsService.getAll({ offset: queryOffset, limit: queryLimit });
  //   return {
  //     length: res.length,
  //     offset: queryOffset,
  //     limit: queryLimit,
  //     alerts: res,
  //   };
  // }
  // @UseGuards(AdminGuard)
  // @Post()
  // async createNew(@Body() body: CreateAlertDTO) {
  //   return { id: (await this.alertsService.create(body)).id };
  // }
}
