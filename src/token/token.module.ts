import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ENV } from 'src/settings';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: ENV['JWT_SECRET'],
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
