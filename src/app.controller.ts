import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDto } from './userDto';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/')
  getHello() {
    return { message: 'hellow world' };
  }

  @Post()
  createUser(@Body() user: UserDto) {
    return this.appService.createUser(user);
  }
}
