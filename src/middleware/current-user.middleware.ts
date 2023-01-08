import { ForbiddenException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService, private tokenService: TokenService) {}
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
        if (user.block_status) {
          throw new Error('user is suspended');
        }
        req.currentUser = user;
      }
      next();
    } catch (error) {
      console.log('error - ', error);
      if ((error as Error).message == 'user is suspended') {
        throw new ForbiddenException('user is suspended');
      } else throw new NotFoundException('User not found');
    }
  }
}
