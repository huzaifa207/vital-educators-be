import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { TokenService } from 'src/token/token.service';
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
    private tokenService: TokenService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const jwt: string = req.cookies['jwt'];
      const { id, token } = await this.tokenService.verify(jwt);
      if (token) {
        res.cookie('jwt', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });
      }

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
