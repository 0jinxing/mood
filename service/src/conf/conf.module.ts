import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./conf";

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] })],
  exports: [ConfigModule],
})
export class ConfModule {}
