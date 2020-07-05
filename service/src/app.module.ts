import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfModule } from "./conf/conf.module";
import { AuthModule } from "./auth/auth.module";
import { MongoModule } from "./mongo/mongo.module";

@Module({
  imports: [ConfModule, AuthModule, MongoModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
