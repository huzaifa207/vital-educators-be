require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('etag', 'strong');

  app.enableCors({
    credentials: true,
    origin: 'http://localhost:3000',
  });

  app.use(cookieParser());

  app.use(
    cookieSession({
      keys: ['user'],
      'same-site': 'none',
    }),
  );
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
