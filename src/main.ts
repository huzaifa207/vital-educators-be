/* eslint-disable */
require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
import * as cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const PORT = process.env.PORT || parseInt(process.env.DEV_PORT);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('etag', 'strong');

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
    dsn: process.env.SENTRY_DSN,
  });

  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
