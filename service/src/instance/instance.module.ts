import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Instance, InstanceSchema } from "./instance.schema";
import { InstanceController } from "./instance.controller";
import { InstanceService } from "./instance.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instance.name, schema: InstanceSchema },
    ]),
  ],
  controllers: [InstanceController],
  providers: [InstanceService],
  exports: [InstanceService],
})
export class InstanceModule {}
