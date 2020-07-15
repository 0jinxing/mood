import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Instance, InstanceSchema } from "./instance.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instance.name, schema: InstanceSchema },
    ]),
  ],
})
export class InstanceModule {}
