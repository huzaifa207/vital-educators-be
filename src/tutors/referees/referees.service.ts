import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AlertsService } from 'src/alerts/alerts.service';
import { MailService } from 'src/mail-service/mail.service';
import { EmailType, EmailUtility } from 'src/mail-service/mail.utils';
import { PrismaService } from 'src/prisma-module/prisma.service';

@Injectable()
export class RefereesService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private alertService: AlertsService,
  ) {}

  async create(
    createRefereeDto: Prisma.RefereesCreateInput,
    tutorId: number,
    user: Prisma.UserCreateManyInput,
  ) {
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
          name: `${user.first_name} ${user.last_name}`,
          action: EmailType.REFEREE_REVIEW,
          token,
          other: { referee_name: `${referee.first_name} ${referee.last_name}` },
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
    this.alertService.dispatchRefereeAdded(user.id);
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
        const currentReferee = await this.prisma.referees.findUnique({
          where: { id },
          include: { tutor: { include: { user: true } } },
        });

        if (!currentReferee) {
          throw new BadRequestException('Referee not found');
        }

        const updatedReferee = await this.prisma.referees.update({
          where: { id },
          data: updateRefereeDto,
        });

        if (updateRefereeDto.email && updateRefereeDto.email !== currentReferee.email) {
          const token = await this.jwtService.signAsync(
            { id },
            {
              expiresIn: '1d',
            },
          );

          try {
            this.mailService.sendMail(
              new EmailUtility({
                email: updatedReferee.email as string,
                name: `${currentReferee.tutor.user.first_name} ${currentReferee.tutor.user.last_name}`,
                action: EmailType.REFEREE_REVIEW,
                token,
                other: { referee_name: `${updatedReferee.first_name} ${updatedReferee.last_name}` },
              }),
            );
          } catch (error) {
            console.warn('Failed to send email to updated referee:', error);
          }
        }

        return updatedReferee;
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

      refereeId = id;
    } catch (error) {
      throw new ForbiddenException('Please Enter Valid Token');
    }

    try {
      const existingReview = await this.prisma.refereesReviews.findFirst({
        where: { refereeId: refereeId },
      });

      let review;

      if (existingReview) {
        review = await this.prisma.refereesReviews.update({
          where: { refereeId: refereeId },
          data: refereesReviewsCreateInput,
        });
      } else {
        // Create new review if none exists
        review = await this.prisma.refereesReviews.create({
          data: {
            ...refereesReviewsCreateInput,
            referees: { connect: { id: refereeId } },
          },
        });
      }

      if (!review) {
        throw new ForbiddenException('Please Enter Valid Data');
      }

      try {
        const r = await this.prisma.referees.findUnique({ where: { id: refereeId } });
        if (r) {
          await this.prisma.tutor.update({
            where: { id: r.tutorId },
            data: { is_referee_approved: 'PENDING' },
          });

          const tutor = await this.prisma.tutor.findUnique({
            where: { id: r.tutorId },
            select: { userId: true },
          });

          if (tutor) {
            this.alertService.dispatchRefereeLeftReview(tutor.userId);
          }
        }
      } catch (er) {
        console.warn(er);
      }

      return existingReview ? 'Review Updated successfully' : 'Review Added successfully';
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new ForbiddenException('Please Enter Valid Data');
      }
      throw new ForbiddenException('Failed to process review');
    }
  }
}
