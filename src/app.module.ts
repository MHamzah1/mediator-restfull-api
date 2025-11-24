import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db.config';
import { UsersModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig), // Gunakan konfigurasi database dari dbConfig
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
