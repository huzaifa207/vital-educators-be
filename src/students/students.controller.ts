import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // @Post()
  // createStudentProfile(@Req() req: Request, @Body() profile: string) {
  //   return this.studentsService.createStudentProfile(
  //     (req.currentUser as Prisma.UserCreateManyInput).id,
  //     profile,
  //   );
  // }

  @Get('/payment-record')
  async getPaymentRecord(@Req() req: Request) {
    try {
      const r = await this.studentsService.getStudentPaymentRecord(req.currentUser.id);
      if (!r) throw new Error("payment record doesn't exists");
      return r;
    } catch (er) {
      throw new BadRequestException();
    }
  }

  @Get('/purchase-record')
  async getPurchaseRecord(@Req() req: Request) {
    try {
      const r = await this.studentsService.getStudentPaymentRecord(req.currentUser.id);
      const p = await this.studentsService.getPurchases(req.currentUser.id, false);
      return { record: r, purchases: p };
    } catch (er) {
      console.log('fetch failed');
      console.warn(er);
      throw new BadRequestException(er.toString());
    }
  }

  @Post('/credit-purchase')
  async creditPurchase(@Body() body: { tutorId: number }, @Req() req: Request) {
    try {
      const r = await this.studentsService.creditPurchase(req.currentUser.id, body.tutorId);
      return { id: r.id };
    } catch (er) {
      console.log('purchase failed');
      console.warn(er);
      throw new BadRequestException(er.toString());
    }
  }

  @Post('/stripe-purchase-intent')
  async stripePurchaseIntent(@Body() body: { tutorId: number }, @Req() req: Request) {
    try {
      const r = await this.studentsService.stripePurchaseIntent(req.currentUser.id, body.tutorId);
      return { secret: r.secret };
    } catch (er) {
      console.log('purchase intent failed');
      console.warn(er);
      throw new BadRequestException(er.toString());
    }
  }

  @Get()
  findByUserId(@Req() req: Request) {
    return this.studentsService.findByUserId((req.currentUser as Prisma.UserCreateManyInput).id);
  }

  @Get('/chat-tutors')
  findChatTutors(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.studentsService.findChatTutors(Number(id));
  }
}
