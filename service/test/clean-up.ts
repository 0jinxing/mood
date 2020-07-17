import { Test } from "@nestjs/testing";
import { MongoModule } from "@/mongo/mongo.module";
import { ConfModule } from "@/conf/conf.module";
import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
class CleanUpService {
  constructor(@InjectConnection() private connect: Connection) {}
  async exec() {
    await this.connect.dropDatabase();
  }
}

export async function cleanUp() {
  const moduleRef = await Test.createTestingModule({
    imports: [ConfModule, MongoModule],
    providers: [CleanUpService],
  }).compile();

  const cleanUpService = await moduleRef.resolve(CleanUpService);

  await cleanUpService.exec();
  await moduleRef.close();
}
