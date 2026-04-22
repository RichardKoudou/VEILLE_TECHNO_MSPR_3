import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FeedService } from './modules/feed/feed.service';
import { VeilleService } from './modules/feed/veille.service';
import { FilterService } from './modules/filter/filter.service';
import { ReportService } from './modules/report/report.service';
import { ApiController } from './modules/api/api.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
  ],
  controllers: [ApiController],
  providers: [
    FeedService,
    FilterService,
    ReportService,
    VeilleService,
  ],
})
export class AppModule {}
