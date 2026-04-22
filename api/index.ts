import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const express = require('express');

let cachedServer: any;

async function getServer() {
  if (cachedServer) return cachedServer;

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['log', 'warn', 'error'],
  });

  app.enableCors();
  await app.init();

  cachedServer = server;
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await getServer();
  return server(req, res);
}
