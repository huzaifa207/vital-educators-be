import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Post('/request')
  requestFeedback(@Body() { tutorId, studentId }: { studentId: number; tutorId: number }) {
    return this.feedbackService.requestFeedback(tutorId, studentId);
  }

  @Get('/all/:id/:role')
  getAll(@Param('id') id: string, @Param('role') role: 'tutor' | 'student') {
    return this.feedbackService.findAll(+id, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch('/reply')
  tutorReply(@Body() { id, reply }: { id: number; reply: string }) {
    return this.feedbackService.replyFromTutor(+id, reply);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
  //   return this.feedbackService.update(+id, updateFeedbackDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
