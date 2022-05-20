import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { Request, Response } from 'express';
import { Serializer } from 'src/interceptors/serialized.interceptor';
import { EmailType } from 'src/mail-service/mail.utils';
import { TokenService } from 'src/token/token.service';
import { ReturnUserDto } from './dto/return-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    // private jwtService: JwtService
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  @Serializer(ReturnUserDto)
  async create(
    @Body() createUserDto: Prisma.UserCreateInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.create(createUserDto);
    const jwt = await this.tokenService.generateNewToken(user.id);

    response.cookie('jwt', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return user;
  }

  @Serializer(ReturnUserDto)
  @Post('/login')
  async login(
    @Body()
    loginUserDto: {
      email: string;
      password: string;
      role: Role;
    },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.login(loginUserDto);
    const jwt = await this.tokenService.generateNewToken(user.id);
    response.cookie('jwt', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return user;
  }

  @Post('/signout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const jwt: string = req.cookies['jwt'];
    await this.tokenService.deleteToken(jwt);

    response.clearCookie('jwt', {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
    });
    return { message: 'Logged out' };
  }

  @Serializer(ReturnUserDto)
  @Get('/all')
  findAll() {
    console.log('first 11');
    return this.usersService.findAll();
  }

  @Patch()
  @Serializer(ReturnUserDto)
  update(@Body() updateUserDto: Prisma.UserUpdateInput, @Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch('/updatePassword')
  async updatePassword(
    @Body() body: { password: string; newPassword: string },
    @Req() request: Request,
  ) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    const { success } = await this.usersService.updatePassword(
      +id,
      body.password,
      body.newPassword,
    );
    if (success) {
      await this.tokenService.deleteAllTokens(id);
    }
    return success;
  }

  @Get('/confirm-email/:token')
  async confirmEmail(@Param('token') token: string, @Res() res: Response) {
    const { approved, role } = await this.usersService.confirmEmail(token);
    let URL = '';
    switch (role) {
      case 'STUDENT':
        URL = `https://vital-educators.vercel.app/student/email-verified`;
        break;
      case 'TUTOR':
        URL = `https://vital-educators.vercel.app/tutor/email-verified`;
        break;
    }
    if (approved) {
      res.header('Location', URL);
      res.statusCode = 301;
      res.end();
    }
  }

  @Serializer(ReturnUserDto)
  @Get()
  currentUser(@Req() request: Request) {
    console.log('USER:');
    console.log(request.currentUser);
    return request.currentUser as Prisma.UserCreateManyInput;
  }

  @Get(':id')
  @Serializer(ReturnUserDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post('/send')
  async sendEmail(@Body() body: { email: string; name: string; emailToken: string }) {
    await this.usersService.sendEmail(
      body.email,
      body.name,
      EmailType.CONFIRM_EMAIL,
      body.emailToken,
    );
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return await this.usersService.forgotPassword(body.email);
  }

  @Post('/reset-password')
  async resetPassword(@Body() body: { email: string; password: string; passwordToken: number }) {
    const { id, success } = await this.usersService.resetPassword(
      body.email,
      body.password,
      body.passwordToken,
    );
    if (success) {
      await this.tokenService.deleteAllTokens(id);
    }
    return success;
  }

  // ----------PORSONAL DEV ROUTES-----------

  @Delete('/all')
  deleteMany() {
    return this.usersService.deleteMany();
  }

  @Delete()
  async remove(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return await this.usersService.remove(+id);
  }
}
