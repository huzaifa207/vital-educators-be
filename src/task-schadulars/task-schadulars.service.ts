import { Injectable, Logger } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { CronJob } from 'cron';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { UserDto } from 'src/userDto';
import { TutorsService } from './../tutors/tutors.service';

@Injectable()
export class TaskSchadularsService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly tutorsService: TutorsService,
    private mailService: MailService,
  ) {}
  private readonly logger = new Logger('AppService');
  async newTutorSchedule(userData: Prisma.UserCreateManyInput, tutor: Prisma.TutorCreateManyInput) {
    // EVERY_DAY_AT_9PM
    const tutorJob = new CronJob(CronExpression.EVERY_DAY_AT_10AM, async () => {
      const { documents, referees, subjects, tutoringDetail } = await this.tutorsService.tutorStats(
        tutor.id,
      );

      const tutorReminder: string[] = [];
      if (referees.length === 0) {
        tutorReminder.push('Referees Information');
      }

      if (subjects.length === 0) {
        tutorReminder.push('Subjects Information');
      }

      const { about, approach, availability, teaching_experience, year_of_experience } =
        tutoringDetail;
      if (!about || !approach || !availability || !teaching_experience || !year_of_experience) {
        tutorReminder.push('Tutoring Details Information');
      }

      if (documents.length === 1) {
        const { id_card_back, id_card_front, criminal_record } = documents[0];
        if (!id_card_back || !id_card_front || !criminal_record) {
          tutorReminder.push('Government Documents Information');
        }
      }
      if (tutorReminder.length > 0) {
        let data = '';
        tutorReminder.forEach((rem) => {
          data += `<li>${rem}</li>`;
        });

        await this.mailService.sendMail(
          new EmailUtility({
            email: userData.email,
            username: `${userData.first_name} ${userData.last_name}`,
            action: EmailType.REMINDER,
            other: {
              list: data as string,
            },
          }),
        );
      }
    });
    setTimeout(() => {
      tutorJob.start();
    }, 60000);
  }

  emitt(user: UserDto) {
    this.userCreatedSchedular(user);
  }

  userCreatedSchedular(user: UserDto) {
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, () => {
      this.logger.warn(`time to run! ${user.name}`);
    });

    this.schedulerRegistry.addCronJob(`${user.name}-${user.age}`, job);
    job.start();
  }
}
