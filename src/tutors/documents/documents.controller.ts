import { Body, Controller, Delete, Get, Patch, Post, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { DocumentsService } from './documents.service';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('document')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: Prisma.DocumentsCreateInput, @Req() request: Request) {
    const { id } = request.currentTutor;
    return this.documentsService.create(createDocumentDto, +id);
  }

  @Get()
  findOne(@Req() request: Request) {
    const { id } = request.currentTutor;
    return this.documentsService.findOne(+id);
  }

  @Patch('')
  update(@Body() updateDocumentDto: UpdateDocumentDto, @Req() request: Request) {
    const { id } = request.currentTutor;
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete()
  remove(@Req() request: Request) {
    const { id } = request.currentTutor;
    return this.documentsService.remove(+id);
  }
}
