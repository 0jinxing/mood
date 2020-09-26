import { Module } from '@nestjs/common';
import { ConfModule } from './conf/conf.module';
import { AuthModule } from './auth/auth.module';
import { MongoModule } from './mongo/mongo.module';
import { UserModule } from './user/user.module';
import { InstanceModule } from './instance/instance.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    // base module
    ConfModule,
    MongoModule,
    AuthModule,
    // business module
    UserModule,
    InstanceModule,
    ReportModule
  ]
})
export class AppModule {}
