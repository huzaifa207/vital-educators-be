import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: Prisma.UserCreateInput;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const jwt = req.cookies['jwt'];
      const { id } = this.jwtService.verify(jwt) || {};
      console.log('jwt', id, jwt);
      if (id) {
        const user = await this.userService.findOne(id);
        req.currentUser = user;
      }
      next();
    } catch (error) {
      console.log('error - ', error);
      throw new NotFoundException('User not found');
    }
  }
}
