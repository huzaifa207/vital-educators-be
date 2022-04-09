import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes, scrypt as _script } from 'crypto';
import { nanoid } from 'nanoid';
import { promisify } from 'util';
import { PrismaService } from './../prisma.service';

const scrypt = promisify(_script);

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    const userAlreadyExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userAlreadyExists) {
      throw new Error('User already exists');
    }
    //   -- Generate a HashPassowrd

    const salt = randomBytes(8).toString('hex'); // 8 Bytes, 16 character long string
    const hash = (await scrypt(createUserDto.password, salt, 16)) as Buffer;
    const hashPassowrd = salt + '.' + hash.toString('hex');

    const emailToken = nanoid(12);

    const user = await this.prisma.user.create({
      data: Object.assign(createUserDto, {
        password: hashPassowrd,
        email_token: emailToken,
      }),
    });

    // this.sendConfirmationEmail(user.email, user.username, emailToken);

    return user;
  }

  async login(loginUserDto: {
    email?: string;
    username?: string;
    password: string;
  }) {
    let currentUser = loginUserDto.email
      ? await this.prisma.user.findUnique({
          where: { email: loginUserDto.email },
        })
      : await this.prisma.user.findUnique({
          where: { username: loginUserDto.username },
        });

    const [salt, storedHash] = currentUser.password.split('.');
    const hash = (await scrypt(loginUserDto.password, salt, 16)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid password');
    }

    return currentUser;
  }

  findAll() {
    return this.prisma.user.findMany();
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

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async sendConfirmationEmail(
    email: string,
    username: string,
    emailToken: string,
  ) {
    // await this.mailService.sendConfirmationEmail(email, username, emailToken);
  }
}
