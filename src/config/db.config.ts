import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dbConfig: PostgresConnectionOptions = {
  url: 'postgresql://neondb_owner:npg_qNf1HhP0mEQn@ep-misty-surf-a4mbrc5n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  type: 'postgres',
  port: 5432,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};
