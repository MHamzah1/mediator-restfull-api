import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const expressApp = express();
let cachedApp: NestExpressApplication;

async function createNestApp(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // ✅ Serve static files untuk uploaded images
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ Konfigurasi CORS - ALLOW ALL
  app.enableCors({
    origin: true, // ✅ Izinkan semua origin
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
    .setDescription(
      'API Kalkulator Harga Mobil Bekas + Warehouse & Showroom Module - Versi 3.0',
    )
    .setVersion('3.0')
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
    .addTag('Marketplace Listings', 'Marketplace listings with image upload')
    // Warehouse & Showroom Module Tags
    .addTag('Warehouse - Showrooms', 'Manajemen showroom')
    .addTag('Warehouse - Vehicles', 'Registrasi & manajemen kendaraan warehouse')
    .addTag('Warehouse - Inspections', 'Inspeksi kendaraan masuk')
    .addTag('Warehouse - Zones', 'Zona gudang (GD-A/B/C/D/SRM)')
    .addTag('Warehouse - Repairs', 'Work order perbaikan kendaraan')
    .addTag('Warehouse - Admin Payments', 'Pembayaran biaya admin Rp 2.000.000')
    .addTag('Warehouse - Purchases', 'Transaksi pembelian kendaraan')
    .addTag('Warehouse - Stock Logs', 'Riwayat stok & audit trail')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();
  cachedApp = app;
  return app;
}

// For Vercel Serverless
export default async function handler(req: any, res: any) {
  await createNestApp();
  expressApp(req, res);
}

// For local development
async function bootstrap() {
  const app = await createNestApp();
  await app.listen(8080, '0.0.0.0'); // ✅ ini penting

  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 8080}`,
  );
  console.log(
    `Swagger docs available at: http://localhost:${process.env.PORT ?? 8080}/api/docs`,
  );
  console.log(
    `Uploaded files available at: http://localhost:${process.env.PORT ?? 8080}/uploads/`,
  );
}

// Only run bootstrap in non-serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  bootstrap();
}
