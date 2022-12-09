import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma, PurchaseStatus } from '@prisma/client';
import { UpdateTutorDto } from 'src/tutors/dto/update-tutor.dto';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { QualificationsService } from 'src/tutors/qualifications/qualifications.service';
import { SubjectOffersModule } from 'src/tutors/subject-offers/subject-offers.module';
import { SubjectOffersService } from 'src/tutors/subject-offers/subject-offers.service';
import { StudentsService } from 'src/students/students.service';
import { Request } from 'express';
import { ENV } from 'src/settings';
import { AlertsService } from 'src/alerts/alerts.service';

@Controller('/admin')
export class AdminController {
  constructor(
    private readonly tutorService: TutorsService,
    private readonly refereeService: RefereesService,
    private readonly adminService: AdminService,
    private readonly studentsService: StudentsService,
    private alertsService: AlertsService,
  ) {}
  @UseGuards(AdminGuard)
  @Get('tutor/:tutorId')
  async getTutorById(@Param('tutorId', new ParseIntPipe()) tutorId: number) {
    const tutorDetails = await this.tutorService.getTutorProfile(tutorId, {
      userExcludedFields: ['password', 'password_reset_token'],
    });

    return {
      ...tutorDetails,
      referees: await this.refereeService.findAll(tutorId),
    };
  }
  @UseGuards(AdminGuard)
  @Post('tutor/:tutorId/cancel-subscription')
  async cancelTutorSubscription(
    @Param('tutorId', new ParseIntPipe()) tutorId: number,
    @Body() body: { type: 'SCHEDULE' | 'INSTANT' },
  ) {
    if (body.type === 'INSTANT') await this.tutorService.cancelSubscriptionInstant(tutorId);
    else if (body.type == 'SCHEDULE') await this.tutorService.cancelSubscription(tutorId);
    else throw new BadRequestException('invalid type');
    return {
      ok: true,
    };
  }
  @UseGuards(AdminGuard)
  @Get('student/disputes')
  async getStudentDisputes() {
    return await this.studentsService.getAllDisputes();
  }
  @UseGuards(AdminGuard)
  @Post('student/close-dispute')
  async closeDispute(
    @Req() req: Request,
    @Body() body: { disputeId: number; description: string; awardCredit: boolean },
  ) {
    try {
      this.alertsService.create({
        actionURL: `${ENV['FRONTEND_URL']}/admin/disputes`,
        description: 'Dispute has been marked as closed.',
      });
    } catch (er) {
      console.warn(er);
    }
    return await this.studentsService.closeDispute(
      body.disputeId,
      body.description,
      body.awardCredit,
    );
  }
  @UseGuards(AdminGuard)
  @Post('tutor/:tutorId/reinstate-subscription')
  async reinstateTutorSubscription(@Param('tutorId', new ParseIntPipe()) tutorId: number) {
    if ((await this.tutorService.getSubscription(tutorId)).cancelled) {
      await this.tutorService.reinstateSubscription(tutorId);
    } else throw new BadRequestException('subscription is not canceled');
    return {
      ok: true,
    };
  }
  @UseGuards(AdminGuard)
  @Get('stats')
  async getStats() {
    return await this.adminService.getStats();
  }

  @UseGuards(AdminGuard)
  @Post('students/:studentId/accumulate-credits')
  async studentAccumulateCredits(
    @Body() { accumulator }: { accumulator: number }, // can be either +/-
    @Param('studentId', new ParseIntPipe()) studentId: number,
  ) {
    return { total_credits: await this.studentsService.accumulateCredits(studentId, accumulator) };
  }

  @UseGuards(AdminGuard)
  @Post('/purchase-status')
  async studentPurchaseStatus(
    @Body() { status, purchaseId }: { purchaseId: number; status: 'Suspend' | 'Delete' | 'Active' }, // can be either +/- // @Param('studentId', new ParseIntPipe()) studentId: number,
  ) {
    return { status: await this.studentsService.setPurchaseStatus(purchaseId, status) };
  }

  @UseGuards(AdminGuard)
  @Get('students/:studentId/purchase-records')
  async getPurchaseRecord(
    @Req() req: Request,
    @Param('studentId', new ParseIntPipe()) studentId: number,
  ) {
    try {
      const r = await this.studentsService.getStudentPaymentRecord(studentId);
      const p = await this.studentsService.getPurchases(studentId, true);
      return { record: r, purchases: p };
    } catch (er) {
      console.log('fetch failed');
      console.warn(er);
      throw new BadRequestException(er.toString());
    }
  }

  @UseGuards(AdminGuard)
  @Patch('tutor-detail/:tutorId')
  update(
    @Body() updateTutorDto: UpdateTutorDto,
    @Param('tutorId', new ParseIntPipe()) tutorId: number,
  ) {
    return this.tutorService.updateTutor(tutorId, updateTutorDto);
  }
}
