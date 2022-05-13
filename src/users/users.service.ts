import { BadRequestException, Injectable, NotAcceptableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes, scrypt as _script } from 'crypto';
import { nanoid } from 'nanoid';
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
  ) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    const userAlreadyExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userAlreadyExists) {
      throw new NotAcceptableException('User already exists');
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
    this.sendEmail(newUser.email, newUser.username, EmailType.CONFIRM_EMAIL, newUser.email_token);
    return newUser;
  }

  async login(loginUserDto: { username: string; password: string }) {
    try {
      const currentUser = await this.findUser(loginUserDto.username);

      const [salt, storedHash] = currentUser.password.split('.');
      const hash = (await scrypt(loginUserDto.password, salt, 16)) as Buffer;

      if (storedHash !== hash.toString('hex')) {
        throw new BadRequestException('Invalid password');
      }

      return currentUser;
    } catch (error) {
      throw new BadRequestException('Invalid credentials');
    }
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
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
      await this.prisma.user.update({
        where: { email_token: emailToken },
        data: {
          email_token: null,
          email_approved: true,
        },
      });
      return { approved: true };
    } catch (error) {
      return { approved: false };
    }
  }

  async forgotPassword(username: string) {
    try {
      const user = await this.findUser(username);

      //generate 4 digit random number
      const token = Math.floor(1000 + Math.random() * 9000);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password_reset_token: token,
        },
      });

      await this.sendEmail(user.email, user.username, EmailType.RESET_PASSWORD, token);
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something went wrong');
    }
  }

  async resetPassword(username: string, password: string, passwordToken: number) {
    try {
      const user = await this.findUser(username);
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

  private async findUser(username: string) {
    try {
      const user =
        (await this.prisma.user.findUnique({
          where: { email: username },
        })) ||
        (await this.prisma.user.findUnique({
          where: { username: username },
        }));
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

  async sendEmail(email: string, username: string, action: EmailType, token: string | number) {
    await this.mailService.sendMail(new EmailUtility({ email, username, action, token }));
  }

  // ------------ PERSONAL DEV SERVICES ------------

  findAll() {
    return this.prisma.user.findMany();
  }

  deleteMany() {
    return this.prisma.user.deleteMany({});
  }

  async remove(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return 'User deleted';
  }
}
