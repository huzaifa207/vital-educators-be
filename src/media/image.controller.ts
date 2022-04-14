import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
@Controller('image')
class ImageController {
  @Post()
  uploadImage(@Req() request: Request) {
    let file: any = (request.files as any).image;
  }
}
