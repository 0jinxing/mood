import { Module } from "@nestjs/common";
import { ConfModule } from "./conf/conf.module";
import { AuthModule } from "./auth/auth.module";
import { MongoModule } from "./mongo/mongo.module";
import { UserModule } from "./user/user.module";
import { InstanceModule } from "./instance/instance.module";

@Module({
  imports: [ConfModule, MongoModule, AuthModule, UserModule, InstanceModule],
})
export class AppModule {}
