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
    const isTutorWithEmailExist = await this.prisma.tutor.findMany({
      where: { user: { email: createRefereeDto.email } },
    });

    if (isTutorWithEmailExist.length !== 1) {
      throw new BadRequestException('Tutor with this email does not exist');
    }

    const refereeAlreadyExist = await this.prisma.referees.findMany({
      where: {
        email: createRefereeDto.email,
      },
    });
    if (refereeAlreadyExist.length > 0) {
      throw new BadRequestException('Referee Already Exist');
    }

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
      this.mailService.sendMail(
        new EmailUtility({
          email: referee.email,
          username: `${user.first_name} ${user.last_name}`,
          action: EmailType.REFEREE_REVIEW,
          token,
          other: { referee_name: `${referee.first_name} ${referee.last_name}` },
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
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

  private async checkReferee(refereeId: number, tutorId: number): Promise<boolean> {
    const referee = await this.prisma.referees.findUnique({
      where: { id: refereeId },
    });
    if (+referee.tutorId !== +tutorId) {
      throw new ForbiddenException('You are not the owner of this referee');
    }
    return true;
  }

  async addRefereeReviw(
    token: string,
    refereesReviewsCreateInput: Prisma.RefereesReviewsCreateInput,
  ) {
    let refereeId: number;
    try {
      const { id } = await this.jwtService.verify(token);
      console.log('id');
      refereeId = id;
    } catch (error) {
      console.log('token error', error);
      throw new ForbiddenException('Please Enter Valid Token');
    }
    try {
      const review = await this.prisma.refereesReviews.create({
        data: {
          ...refereesReviewsCreateInput,
          referees: { connect: { id: refereeId } },
        },
      });
      if (!review) {
        throw new ForbiddenException('Please Enter Valid Data');
      }
      return 'Review Added successfully';
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new ForbiddenException('Please Enter Valid Data');
      }
      throw new ForbiddenException('Already Reviewed');
    }
  }
}
