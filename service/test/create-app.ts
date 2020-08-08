import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';

export async function createApp() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
