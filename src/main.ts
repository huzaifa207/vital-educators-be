require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('etag', 'strong');

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  app.enableCors({
    credentials: true,
    origin: 'https://localhost:3000',
  });

  app.use(cookieParser());

  app.use(
    cookieSession({
      keys: ['user'],
    }),
  );

  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
