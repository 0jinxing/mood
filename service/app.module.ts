import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import configuration from "./config/configuration";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
