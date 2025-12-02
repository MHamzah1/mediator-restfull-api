import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // ✅ Setup Swagger - CEK ENVIRONMENT VARIABLE
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Mediator RESTful API')
      .setDescription('API Documentation untuk Mediator Application')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // Nama identifier untuk bearer auth
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log('✅ Swagger enabled');
  } else {
    console.log('❌ Swagger disabled (set ENABLE_SWAGGER=true to enable)');
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );

  if (enableSwagger) {
    console.log(
      `Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
    );
  }
}
bootstrap();
