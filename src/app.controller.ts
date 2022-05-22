import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/')
  getHello() {
    return { message: 'hellow world' };
  }

  @Post()
  createUser(@Body() user: { email: string; password: string }) {
    return this.appService.createUser(user);
  }
}
