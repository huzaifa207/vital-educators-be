import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { randomBytes, scrypt as _script } from 'crypto';
import { nanoid } from 'nanoid';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { TaskSchadularsService } from 'src/task-schadulars/task-schadulars.service';
import { DocumentsService } from 'src/tutors/documents/documents.service';
import { TutoringDetailsService } from 'src/tutors/tutoring-details/tutoring-details.service';
import { promisify } from 'util';
import { PrismaService } from './../prisma.service';
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
  ) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    const userAlreadyExists =
      ((await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      })) &&
        'Email aready exist') ||
      '';

    if (userAlreadyExists) {
      throw new NotAcceptableException(userAlreadyExists);
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
          id_card_back: '',
          id_card_front: '',
          criminal_record: '',
        } as Prisma.DocumentsCreateInput;

        await this.documentsService.create(doc, +tutor.id);

        const tutoringDetail = {
          about: '',
          year_of_experience: 0,
          teaching_experience: '',
          approach: '',
          availability: '',
        } as Prisma.TutoringDetailCreateInput;

        await this.tutoringDetailsService.create(tutoringDetail, +tutor.id);
      } catch (error) {
        throw new BadRequestException("Couldn't create tutor");
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

  async login({ email, password, role }: { email: string; password: string; role: Role }) {
    try {
      const _role = role ? role : Role.TUTOR;
      const currentUser = await this.prisma.user.findFirst({
        where: {
          AND: [{ email }, { role: _role }],
        },
      });

      const [salt, storedHash] = currentUser.password.split('.');
      const hash = (await scrypt(password, salt, 16)) as Buffer;

      if (storedHash !== hash.toString('hex')) {
        throw new BadRequestException('Invalid password');
      }

      return currentUser;
    } catch (error) {
      throw new BadRequestException('Invalid credentials');
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    try {
      const r = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      this.alertService.dispatchTutorProfileUpdated(id);
      return r;
    } catch (er) {
      throw er;
    }
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

  findAll(
    queryOptions: {
      offset?: number;
      limit?: number;
      role?: 'ALL' | 'ADMIN' | 'TUTOR' | 'STUDENT';
    } = {
      offset: 0,
      limit: undefined,
      role: undefined,
    },
  ) {
    try {
      // console.log('first 22');
      return (
        this.prisma.user.findMany({
          skip: queryOptions.offset,
          take: queryOptions.limit,

          ...(!queryOptions.role || queryOptions.role == 'ALL'
            ? {}
            : { where: { role: queryOptions.role } }),
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
