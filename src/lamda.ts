// lambda.ts
import { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createNestApp } from './main.server';

let cachedHandler: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await createNestApp();
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  cachedHandler = cachedHandler ?? (await bootstrap());
  return cachedHandler(event, context, callback);
};
