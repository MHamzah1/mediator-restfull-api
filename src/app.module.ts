import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig), // Gunakan konfigurasi database dari dbConfig
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
