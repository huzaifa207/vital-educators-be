import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

interface IJwt {
  id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async sign(id: number): Promise<string> {
    const token = await this.jwtService.signAsync(
      { id },
      {
        expiresIn: '1d',
      },
    );
    let returnToken: string;

    try {
      const newToken = await this.prisma.whitelist.create({
        data: {
          id,
          token,
        },
      });
      returnToken = newToken.token;
    } catch (error) {
      const currentToken = await this.prisma.whitelist.findFirst({
        where: {
          id,
        },
      });
      returnToken = currentToken.token;
    }

    return returnToken;
  }

  async verify(token: string) {
    try {
      const { id, iat }: IJwt = await this.jwtService.verifyAsync(token);

      const whitelistToken = await this.prisma.whitelist.findFirst({
        where: {
          id,
        },
      });

      console.log({ white: whitelistToken.token, token });
      if (whitelistToken.token !== token) {
        throw new Error('comparison');
      }

      let JWTToken: string = '';
      // 14400
      if (Math.floor(Date.now() / 1000) - iat > 14400) {
        if ((await this.deleteToken(id)).ok) {
          JWTToken = await this.sign(id);
        }
      }
      return { id, token: JWTToken };
    } catch (error) {
      if (error.message === 'comparison') {
        throw new ForbiddenException('Please provide latest token');
      }
      throw new ForbiddenException('Something went wrong');
    }
  }

  async deleteToken(id: number) {
    try {
      await this.prisma.whitelist.delete({
        where: {
          id,
        },
      });
      return { ok: true };
    } catch (error) {
      throw new ForbiddenException('Invalid token for delete');
    }
  }
}
