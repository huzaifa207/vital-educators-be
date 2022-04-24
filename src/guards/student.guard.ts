import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';

export class StudentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.currentUser as Prisma.UserCreateManyInput;
    if (!user || user.role !== 'STUDENT') {
      return false;
    }
    return true;
  }
}
