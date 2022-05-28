import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StudentsService } from './../students.service';

declare global {
  namespace Express {
    interface Request {
      currentStudent?: Prisma.StudentCreateManyInput;
    }
  }
}

@Injectable()
export class CurrentStudentMiddleware implements NestMiddleware {
  constructor(private readonly studentsService: StudentsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser as Prisma.UserCreateManyInput;
      const student = await this.studentsService.findByUserId(user.id);
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      req.currentStudent = student;
      next();
    } catch (error) {
      throw new NotFoundException('Student not found');
    }
  }
}
