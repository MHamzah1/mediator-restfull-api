import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Tambahkan validasi global agar DTO dijalankan
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // otomatis hapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // error kalau ada field asing
      transform: true, // auto-transform payload sesuai tipe DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
