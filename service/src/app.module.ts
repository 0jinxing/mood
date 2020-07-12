import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfModule } from "./conf/conf.module";
import { AuthModule } from "./auth/auth.module";
import { MongoModule } from "./mongo/mongo.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [ConfModule, AuthModule, MongoModule, UserModule],
})
export class AppModule {}
