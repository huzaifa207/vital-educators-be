import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RefereesService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async create(
    createRefereeDto: Prisma.RefereesCreateInput,
    tutorId: number,
    user: Prisma.UserCreateManyInput,
  ) {
    // insert data in one to many relation in prisma
    const referee = await this.prisma.referees.create({
      data: {
        ...createRefereeDto,
        tutor: { connect: { id: tutorId } },
      },
    });
    const { id } = referee;
    const token = await this.jwtService.signAsync(
      { id },
      {
        expiresIn: '1d',
      },
    );
    try {
      console.log(referee.email);
      await this.mailService.sendMail(
        new EmailUtility({
          email: referee.email,
          username: `${user.first_name} ${user.last_name}`,
          action: EmailType.REFEREE_REGISTER,
          token,
          other: { referee_name: `${referee.first_name} ${referee.last_name}` },
        }),
      );
    } catch (error) {
      console.log(error);
    }

    return referee;
  }

  async findAll(tutorId: number) {
    return await this.prisma.referees.findMany({
      where: {
        tutor: { id: tutorId },
      },
    });
  }

  async findOne(id: number) {
    return (
      (await this.prisma.referees.findUnique({ where: { id } })) || {
        message: 'Referee not found',
      }
    );
  }

  async update(id: number, tutorId: number, updateRefereeDto: Prisma.RefereesUpdateInput) {
    try {
      if (await this.checkReferee(id, tutorId)) {
        return await this.prisma.referees.update({
          where: { id },
          data: updateRefereeDto,
        });
      }
    } catch (error) {
      throw new BadRequestException('Referee not found');
    }
  }

  async remove(id: number, tutorId: number) {
    try {
      if (await this.checkReferee(id, tutorId)) {
        await this.prisma.referees.delete({ where: { id } });
        return { message: 'Referee deleted' };
      }
    } catch (error) {
      throw new BadRequestException('Referee not found');
    }
  }

  private async checkReferee(refereeId: number, tutorId: number): Promise<Boolean> {
    const referee = await this.prisma.referees.findUnique({
      where: { id: refereeId },
    });
    if (+referee.tutorId !== +tutorId) {
      throw new ForbiddenException('You are not the owner of this referee');
    }
    return true;
  }
}
