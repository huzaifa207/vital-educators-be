import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async generateNewToken(id: number): Promise<string> {
    const token = await this.jwtService.signAsync(
      { id },
      {
        expiresIn: '1d',
      },
    );

    const newToken = await this.prisma.whitelist.create({
      data: {
        id,
        token,
      },
    });
    return newToken.token;
  }

  async verify(token: string) {
    try {
      const { id, iat }: IJwt = await this.jwtService.verifyAsync(token);

      const whitelistToken = await this.prisma.whitelist.findFirst({
        where: {
          id,
          token,
        },
      });

      if (!whitelistToken) {
        throw new NotFoundException('Token not found');
      }

      let JWTToken = '';

      // Assign new token to user after 4 hours

      if (Math.floor(Date.now() / 1000) - iat > 14400) {
        if ((await this.deleteToken(token)).ok) {
          JWTToken = await this.generateNewToken(id);
        }
      }
      return { id, token: JWTToken };
    } catch (error) {
      throw new ForbiddenException('Please provide new Token');
    }
  }

  async deleteToken(token: string) {
    try {
      await this.prisma.whitelist.delete({
        where: {
          token,
        },
      });
      return { ok: true };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Invalid token for delete');
    }
  }

  async deleteAllTokens(id: number) {
    try {
      await this.prisma.whitelist.deleteMany({
        where: {
          id,
        },
      });
      return { ok: true };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Invalid token for delete');
    }
  }
}
