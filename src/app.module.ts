import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './Brand/brand.module';
import { CarModelModule } from './CarModel/car-model.module';
import { SpecificationModule } from './Specification/specification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    UsersModule,
    AuthModule,
    BrandModule,
    CarModelModule,
    SpecificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
