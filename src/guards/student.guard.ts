import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '@prisma/client';
export class StudentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.currentUser as User;
    if (!user || !(user.role == 'STUDENT' || user.role == 'ADMIN')) {
      return false;
    }
    return true;
  }
}
