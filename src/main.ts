import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Konfigurasi CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3000/api/docs',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
  });

  // ✅ Tambahkan validasi global agar DTO dijalankan
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ✅ Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Mediator RESTful API')
    .setDescription('API Kalkulator Harga Mobil Bekas - Versi 2.1')
    .setVersion('2.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login & Register')
    .addTag('Users', 'User management')
    .addTag('Brands', 'Brand management')
    .addTag('Car Models', 'Car Model management')
    .addTag('Variants', 'Variant/Tipe management (NEW)')
    .addTag('Year Prices', 'Year Price management (NEW)')
    .addTag('Price Adjustments', 'Price Adjustment per Model (NEW)')
    .addTag('Price Calculator', 'Price calculation (NEW)')
    .addTag('Calculation History', 'Calculation history (NEW)')
    .addTag('Specifications', 'Specification management')
    .addTag('Custom Prices', 'Custom Price management')
    .addTag('Marketplace', 'Marketplace listings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}
bootstrap();
