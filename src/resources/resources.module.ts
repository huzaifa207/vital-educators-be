import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail-service/mail.module';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [MailModule, MediaModule],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
