import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

// mongoose.set('debug', true);

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI')
      })
    })
  ],
  exports: [MongooseModule]
})
export class MongoModule {}
