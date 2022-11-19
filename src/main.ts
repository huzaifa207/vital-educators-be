/* eslint-disable */
require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
// import { config } from 'aws-sdk';
import * as cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma-module/prisma.service';
import { ENV } from 'src/settings';
const cookieSession = require('cookie-session');
async function bootstrap() {
  // config.update({
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   region: process.env.AWS_REGION,
  // });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.set('etag', 'strong');
  app;
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  app.enableCors({
    credentials: true,
    origin: ['https://localhost:3000', 'https://vital-educators.vercel.app'],
  });

  app.use(cookieParser());

  app.use(
    cookieSession({
      keys: ['user'],
    }),
  );

  Sentry.init({
    dsn: ENV['SENTRY_DSN'],
  });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(ENV['PORT'], () => console.log(`Server running on port ${ENV['PORT']}`));
}
bootstrap();
