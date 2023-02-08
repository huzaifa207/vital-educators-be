import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // console.log('DB:', process.env.DATABASE_URL);
    super({
      // datasources: { db: { url: process.env.DATABASE_URL + '?connection_limit=55' } },
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
