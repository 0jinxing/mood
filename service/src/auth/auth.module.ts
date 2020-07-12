import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

const JWT = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],

  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>("JWT_SECRET"),
    signOptions: { expiresIn: configService.get<string>("JWT_EXPIRES") },
  }),
});

@Global()
@Module({
  imports: [ConfigModule, UserModule, JWT],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
