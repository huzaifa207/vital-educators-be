import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { scrypt as _script, randomBytes } from 'crypto';
import { nanoid } from 'nanoid';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { emailRecovered } from 'src/mail-service/templates/email-recovered';
import { emailSuspended } from 'src/mail-service/templates/email-suspended';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { StudentsService } from 'src/students/students.service';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
import { TutorsService } from 'src/tutors/tutors.service';
import { promisify } from 'util';
const scrypt = promisify(_script);

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private documentsService: DocumentsService,
    private tutoringDetailsService: TutoringDetailsService,
    private taskSchadularsService: TaskSchadularsService,
    private alertService: AlertsService,
    private tutorsService: TutorsService,
    private stripeService: StripeService,
    private studentsService: StudentsService,
  ) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    try {
      const userAlreadyExists = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      if (userAlreadyExists) {
        throw new NotAcceptableException('User already exists');
      }
    } catch (error) {
      throw new BadRequestException(error);
    }

    const hashPassowrd = await this.passHashGenerator(createUserDto.password);
    const emailToken = nanoid(12);
    const newUser = await this.prisma.user.create({
      data: Object.assign(createUserDto, {
        password: hashPassowrd,
        email_token: emailToken,
      }),
    });

    if (newUser.role === 'TUTOR') {
      try {
        const tutor = await this.prisma.tutor.create({
          data: {
            user: { connect: { id: newUser.id } },
          },
        });
        if (tutor) {
          this.taskSchadularsService.newTutorSchedule(newUser, tutor);
        }
        const doc = {
          license_url: '',
          passport_url: '',
          criminal_record_url: '',
        } as Prisma.DocumentsCreateInput;

        await this.documentsService.create(doc, +tutor.id);

        const tutoringDetail = {
          about: '',
          year_of_experience: 0,
          teaching_experience: '',
          approach: '',
          availability: '',
        } as Prisma.TutoringDetailCreateInput;

        try {
          await this.tutorsService.createSubscriptionRecord(newUser.id);
        } catch (er) {
          console.warn(er);
          console.log('Failed to create subs record');
        }

        await this.tutoringDetailsService.create(tutoringDetail, +tutor.id);
      } catch (error) {
        throw new BadRequestException("Couldn't create tutor");
      }
    } else if (newUser.role == 'STUDENT') {
      try {
        await this.studentsService.createPaymentRecord(newUser.id);
      } catch (er) {
        console.warn(er);
        throw new Error('Failed to create student sub records');
      }
    }

    try {
      this.sendEmail(
        newUser.email,
        `${newUser.first_name} ${newUser.last_name}`,
        EmailType.CONFIRM_EMAIL,
        newUser.email_token,
      ).catch((err) => console.log(err));
    } catch (error) {
      console.error(error);
    }

    return newUser;
  }
  async getByCustomerId(customerId: string) {
    try {
      const sub = await this.prisma.subscription.findUnique({ where: { customerId: customerId } });
      return this.findOne(sub.userId);
    } catch (er) {
      return null;
    }
  }

  async login({ email, password, role }: { email: string; password: string; role: Role }) {
    try {
      const _role = role ? role : Role.TUTOR;
      // console.log('email = ', email, password, role);
      const currentUser = await this.prisma.user.findFirst({
        where: {
          AND: [{ email }, { role: _role }],
        },
      });
      // console.log('currentUser = ', currentUser);
      if (!currentUser) {
        throw new BadRequestException('Invalid credentials');
      }

      const [salt, storedHash] = currentUser.password.split('.');
      const hash = (await scrypt(password, salt, 16)) as Buffer;

      if (storedHash !== hash.toString('hex')) {
        throw new BadRequestException('Invalid credentials');
      }
      if (currentUser.block_status == true) {
        throw new BadRequestException('This account has been blocked.');
      }

      if (role == 'TUTOR') {
        const d = await this.prisma.subscription.findUnique({
          where: { userId: currentUser.id },
        });
        if (d.status == 'ACTIVE') return { ...currentUser, subscribed: true };
      }
      return { ...currentUser, subscribed: false };
    } catch (er) {
      console.warn(er);
      throw er;
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (user.role == 'TUTOR') {
        const d = await this.prisma.subscription.findUnique({
          where: { userId: user.id },
        });
        if (d.status == 'ACTIVE') {
          return { ...user, subscribed: true };
        } else {
          return { ...user, subscribed: false };
        }
      }
      return { ...user };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput, alertMessage: string = '') {
    try {
      const r = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      this.alertService.dispatchTutorProfileUpdated(id, alertMessage);
      return r;
    } catch (er) {
      throw er;
    }
  }

  async updateBlockStatus(id: number, status: boolean, reason = '') {
    const user = await this.findOne(id);
    if (!user) return;
    if (user.block_status == status) return; // nothing to update

    if (status == true) {
      try {
        this.mailService.sendMailSimple({
          email: user.email,
          emailContent: emailSuspended(
            reason || 'Reason is not specified',
            `https://www.vitaleducators.com/?from=account-suspended&role=` + user.role,
          ),
          subject: 'Account Suspended',
          text: `Your VitalEducators account has been suspended.`,
        });
      } catch (er) {
        console.warn(er);
      }
    } else {
      let url =
        user.role == 'STUDENT'
          ? `https://www.vitaleducators.com/student/login`
          : `https://www.vitaleducators.com/tutor/login`;
      url = url + '?from=account-recovered';

      try {
        this.mailService.sendMailSimple({
          email: user.email,
          emailContent: emailRecovered(url),
          subject: 'Account Recovered',
          text: `Your VitalEducators account has been recovered.`,
        });
      } catch (er) {
        console.warn(er);
      }
    }

    return this.update(id, {
      block_status: status,
      block_reason: status == true ? reason : '',
    });
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const [salt, storedHash] = currentUser.password.split('.');
      const hash = (await scrypt(currentPassword, salt, 16)) as Buffer;

      if (storedHash !== hash.toString('hex')) {
        throw new BadRequestException('Invalid-Password');
      }
      const newHash = await this.passHashGenerator(newPassword);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: newHash },
      });
      return { success: true };
    } catch (error) {
      if (error.message === 'Invalid-Password') {
        throw new BadRequestException('Invalid-Password');
      }
      throw new BadRequestException('Something went wrong');
    }
  }

  async confirmEmail(emailToken: string) {
    try {
      const user = await this.prisma.user.update({
        where: { email_token: emailToken },
        data: {
          email_token: null,
          email_approved: true,
        },
      });
      return { approved: true, role: user.role };
    } catch (error) {
      return { approved: false };
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.findUser(email);

      //generate 4 digit random number
      const token = Math.floor(1000 + Math.random() * 9000);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password_reset_token: token,
        },
      });

      await this.sendEmail(
        user.email,
        `${user.first_name} ${user.last_name}`,
        EmailType.RESET_PASSWORD,
        token,
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something went wrong');
    }
  }

  async resetPassword(email: string, password: string, passwordToken: number) {
    try {
      const user = await this.findUser(email);
      if (user.password_reset_token !== passwordToken) {
        throw new BadRequestException('Invalid token');
      }
      const newHash = await this.passHashGenerator(password);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: newHash,
          password_reset_token: null,
        },
      });
      return { success: true, id: user.id };
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }

  private async findUser(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }

  private async passHashGenerator(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex'); // 8 Bytes, 16 character long string
    const hash = (await scrypt(password, salt, 16)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  async sendEmail(email: string, name: string, action: EmailType, token: string | number) {
    await this.mailService.sendMail(new EmailUtility({ email, name, action, token }));
  }

  // ------------ PERSONAL DEV SERVICES ------------

  getCount(role?: 'ALL' | 'ADMIN' | 'TUTOR' | 'STUDENT') {
    const where: Prisma.UserWhereInput = {};
    if (role != 'ALL') where.role = role;
    return this.prisma.user.count({
      where,
    });
  }

  findAll(
    queryOptions: {
      offset?: number;
      limit?: number;
      role?: 'ALL' | 'ADMIN' | 'TUTOR' | 'STUDENT';
      status?: 'ALL' | 'BLOCKED' | 'UNBLOCKED';
    } = {
      offset: 0,
      status: 'ALL',
      limit: undefined,
      role: undefined,
    },
  ) {
    try {
      // console.log('first 22');
      const includes: Prisma.UserInclude =
        queryOptions.role === 'TUTOR' ? { subscription: true } : undefined;
      return (
        this.prisma.user.findMany({
          skip: queryOptions.offset,
          take: queryOptions.limit,

          where: {
            ...(!queryOptions.role || queryOptions.role == 'ALL'
              ? {}
              : { role: queryOptions.role }),
            ...(!queryOptions.status || queryOptions.status == 'ALL'
              ? {}
              : { block_status: queryOptions.status == 'BLOCKED' ? true : false }),
          },
          include: includes,
        }) || []
      );
    } catch (error) {
      throw new NotFoundException('Querying users failed with error', error.message);
    }
  }

  deleteMany() {
    return this.prisma.user.deleteMany({});
  }

  async remove(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return 'User deleted';
  }
}
