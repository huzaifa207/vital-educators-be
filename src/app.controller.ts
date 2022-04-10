import { Get } from '@nestjs/common';

export class AppController {
  @Get('/')
  getHello() {
    return { message: 'hellow world' };
  }
}
