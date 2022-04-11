import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { TutorsService } from '../tutors.service';

declare global {
  namespace Express {
    interface Request {
      currentTutor?: Prisma.TutorCreateManyInput;
    }
  }
}

@Injectable()
export class CurrentTutorMiddleware implements NestMiddleware {
  constructor(private readonly tutorService: TutorsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser as Prisma.UserCreateManyInput;
      const tutor = await this.tutorService.findOne(user.id);
      if (!tutor) {
        throw new NotFoundException('Tutor not found');
      }
      req.currentTutor = tutor;
      next();
    } catch (error) {
      throw new NotFoundException('Tutor not found');
    }
  }
}
