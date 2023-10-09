import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateTutorDto } from 'src/tutors/dto/update-tutor.dto';
import { RefereesService } from 'src/tutors/referees/referees.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { StudentsService } from 'src/students/students.service';
import { Request } from 'express';
import { ENV } from 'src/settings';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { NotFoundException } from '@nestjs/common';
import { emailNotification } from 'src/mail-service/templates/email-notification';
import { UsersService } from 'src/users/users.service';

@Controller('/admin')
export class AdminController {
  constructor(
    private readonly tutorService: TutorsService,
    private readonly refereeService: RefereesService,
    private readonly adminService: AdminService,
    private readonly studentsService: StudentsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private alertsService: AlertsService,
  ) {}
  @UseGuards(AdminGuard)
  @Get('tutor/:tutorId')
  async getTutorById(@Param('tutorId', new ParseIntPipe()) tutorId: number) {
    const tutorDetails = await this.tutorService.getTutorProfile(tutorId, {
      userExcludedFields: ['password', 'password_reset_token'],
    });
    const referees = await this.refereeService.findAll(tutorId);

    return {
      ...tutorDetails,
      referees,
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
  async update(
    @Body() updateTutorDto: UpdateTutorDto,
    @Param('tutorId', new ParseIntPipe()) tutorId: number,
    @Query('toBeUpdated') toBeUpdated: string,
  ) {
    try {
      const tutor = await this.tutorService.findOneTutor(tutorId);
      if (!tutor) throw new NotFoundException();

      const user = await this.usersService.findOne(tutor.userId);
      const updatedTutor = await this.tutorService.updateTutor(tutorId, updateTutorDto);

      const document = toBeUpdated.split('_')[1];
      const description =
        document === 'profile'
          ? `Your ${document} picture has been approved`
          : `Your ${document} documents have been approved`;

      this.mailService.sendMailSimple({
        email: user.email,
        text: 'Notification from Vital Educators',
        subject: 'Notification from Vital Educators',
        emailContent: emailNotification('Documents approval', description),
      });

      return updatedTutor;
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }
}
