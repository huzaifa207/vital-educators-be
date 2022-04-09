import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CurrentUserMiddleware } from './middleware/current-user.middleware';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumner: MiddlewareConsumer) {
    consumner
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/create', method: RequestMethod.POST },
        { path: 'user/confirm-email/:token', method: RequestMethod.GET },
      )
      .forRoutes(UsersController);
  }
}
