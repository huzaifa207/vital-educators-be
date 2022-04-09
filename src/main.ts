import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const PORT = 3000;
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
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
