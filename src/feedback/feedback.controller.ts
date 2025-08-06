import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ApproveFeedbackDto } from './dto/update-feedback.dto';
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

  @Get('/admin/all')
  getAllForAdmin(@Query('status') status?: 'APPROVED' | 'REJECTED' | 'PENDING') {
    return this.feedbackService.findAllForAdmin(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch('/reply')
  tutorReply(@Body() { id, reply }: { id: number; reply: string }) {
    return this.feedbackService.replyFromTutor(+id, reply);
  }

  @Patch('/approve/:id')
  approveFeedback(@Param('id') id: string, @Body() approveFeedbackDto: ApproveFeedbackDto) {
    return this.feedbackService.updateApprovalStatus(+id, approveFeedbackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
