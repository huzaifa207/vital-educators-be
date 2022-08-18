import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { FlaggedMessagesService } from './flagged-messages.service';

@Controller('flagged-messages')
export class FlaggedMessagesController {
  constructor(private readonly flaggedMessageService: FlaggedMessagesService) {}
  @Get()
  async getAll(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.flaggedMessageService.getAll({ offset: queryOffset, limit: queryLimit });
    return {
      length: res.length,
      offset: queryOffset,
      limit: queryLimit,
      flaggedMessages: res,
    };
  }
  @Get('/archived')
  async getAllArchived(
    @Query('offset', new DefaultValuePipe('0'), new ParseIntPipe()) queryOffset?: number,
    @Query('limit', new DefaultValuePipe('15'), new ParseIntPipe()) queryLimit?: number,
  ) {
    const res = await this.flaggedMessageService.getAllArchived({
      offset: queryOffset,
      limit: queryLimit,
    });
    return {
      length: res.length,
      offset: queryOffset,
      limit: queryLimit,
      flaggedMessages: res,
    };
  }
  @Delete('/:id')
  async deleteMessage(@Param('id', new ParseIntPipe()) id: number) {
    await this.flaggedMessageService.delete(id);
    return {
      deleteId: id,
    };
  }
}
