import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { Serializer } from 'src/interceptors/serialized.interceptor';
import { ReturnUserDto } from './dto/return-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('/create')
  @Serializer(ReturnUserDto)
  async create(
    @Body() createUserDto: Prisma.UserCreateInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.create(createUserDto);
    const jwt = await this.jwtService.signAsync({ id: user.id });
    response.cookie('jwt', jwt, { httpOnly: true });
    return user;
  }

  @Serializer(ReturnUserDto)
  @Post('/login')
  async login(
    @Body()
    loginUserDto: {
      username: string;
      password: string;
    },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.login(loginUserDto);
    const jwt = await this.jwtService.signAsync({ id: user.id });
    response.cookie('jwt', jwt, { httpOnly: true });
    return user;
  }

  @Post('/signout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'Logged out' };
  }

  @Get('/all')
  @Serializer(ReturnUserDto)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Serializer(ReturnUserDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('/update')
  @Serializer(ReturnUserDto)
  update(
    @Body() updateUserDto: Prisma.UserUpdateInput,
    @Req() request: Request,
  ) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('/delete')
  remove(@Req() request: Request) {
    const { id } = request.currentUser as Prisma.UserCreateManyInput;
    return this.usersService.remove(+id);
  }
  @Get('/confirm-email/:token')
  async confirmEmail(@Param('token') token: string, @Res() res: Response) {
    const user = await this.usersService.confirmEmail(token);
    if (user.approved) {
      res.redirect('/');
    }
  }

  @Serializer(ReturnUserDto)
  @Get()
  currentUser(@Req() request: Request) {
    return request.currentUser as Prisma.UserCreateManyInput;
  }
}
