import { Module } from "@nestjs/common";
import { ConfModule } from "./conf/conf.module";
import { AuthModule } from "./auth/auth.module";
import { MongoModule } from "./mongo/mongo.module";
import { UserModule } from "./user/user.module";
import { InstanceModule } from "./instance/instance.module";
import { EventModule } from "./event/event.module";

@Module({
  imports: [
    // base module
    ConfModule,
    MongoModule,
    AuthModule,
    // business module
    UserModule,
    InstanceModule,
    EventModule,
  ],
})
export class AppModule {}
