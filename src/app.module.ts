import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import {ScheduleService} from "./user/schedule.service";

@Module({
  imports: [
      ConfigModule.forRoot(),
      MongooseModule.forRoot(process.env.MONGODB_URI),
      ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public'),
      }),
      UserModule,
  ],
  controllers: [AppController],
  providers: [ScheduleService, AppService],
})
export class AppModule {}
