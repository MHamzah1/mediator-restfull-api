import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export default registerAs(
  'database',
  (): PostgresConnectionOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    ssl: {
      rejectUnauthorized: false, // penting untuk koneksi Neon.tech
    },
  }),
);
