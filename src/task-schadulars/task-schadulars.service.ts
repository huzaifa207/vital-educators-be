import { Injectable, Logger } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { CronJob } from 'cron';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { TutorsService } from 'src/tutors/tutors.service';

@Injectable()
export class TaskSchadularsService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly tutorsService: TutorsService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}
  private readonly logger = new Logger('AppService');
  async newTutorSchedule(userData: Prisma.UserCreateManyInput, tutor: Prisma.TutorCreateManyInput) {
    // EVERY_DAY_AT_9PM
    const tutorJob = new CronJob(CronExpression.EVERY_DAY_AT_10AM, async () => {
      const { documents, referees, subjects, tutoringDetail } = await this.tutorsService.tutorStats(
        tutor.id,
      );
      const { about, approach, availability, teaching_experience, year_of_experience } =
        tutoringDetail;

      let tutoRemainder: boolean;
      if (
        !referees ||
        !subjects ||
        !tutoringDetail ||
        !about ||
        !approach ||
        !availability ||
        !teaching_experience ||
        !year_of_experience
      ) {
        tutoRemainder = true;
      }
      // const tutorReminder: string[] = [];
      // if (referees.length === 0) {
      //   tutorReminder.push('Referees Information');
      // }

      // if (subjects.length === 0) {
      //   tutorReminder.push('Subjects Information');
      // }

      if (documents.length === 1) {
        const { id_card_back, id_card_front, criminal_record } = documents[0];
        if (!id_card_back || !id_card_front || !criminal_record) {
          tutoRemainder = true;
        }
      }
      // if (tutorReminder.length > 0) {
      //   let data = '';
      //   tutorReminder.forEach((rem) => {
      //     data += `<li>${rem}</li>`;
      //   });
      if (tutoRemainder) {
        await this.mailService.sendMail(
          new EmailUtility({
            email: userData.email,
            name: `${userData.first_name} ${userData.last_name}`,
            action: EmailType.REMINDER,
          }),
        );
      }
      // }
    });
    setTimeout(() => {
      tutorJob.start();
    }, 60000);
  }

  async tutorReplySchedular(convId: number, tutorId: number, student?: Prisma.UserCreateManyInput) {
    const tutorReplyJob = new CronJob(CronExpression.EVERY_DAY_AT_10AM, async () => {
      const { email } = await this.prisma.user.findFirst({
        where: { id: tutorId },
      });

      await this.mailService.sendMail(
        new EmailUtility({
          name: `${student.first_name} ${student.last_name}`,
          email: email,
          action: EmailType.TUTOR_REPLY,
          other: {
            country: student.country,
            profile_url: student.profile_url,
          },
        }),
      );
    });
    return {
      start: () => {
        this.schedulerRegistry.addCronJob(`${convId}`, tutorReplyJob);
        tutorReplyJob.start();
      },
      stop: () => {
        this.schedulerRegistry.deleteCronJob(`${convId}`);
        tutorReplyJob.stop();
      },
    };
  }

  userCreatedSchedular(user: { name: string }) {
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, () => {
      this.logger.warn(`time to run! ${user.name}`);
    });

    this.schedulerRegistry.addCronJob(`${user.name}`, job);
    job.start();
  }
}
