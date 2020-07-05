import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./conf";

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] })],
  exports: [ConfigModule],
})
export class ConfModule {}
