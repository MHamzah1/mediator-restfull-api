// src/main-server.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function createNestApp() {
  const app = await NestFactory.create(AppModule);
  return app;
}
