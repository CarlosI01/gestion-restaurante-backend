import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { json, static as expressStatic, urlencoded } from 'express';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.use('/uploads/menu-items', expressStatic(resolve(config.get<string>('UPLOAD_MENU_ITEMS_DIR', 'uploads/menu-items'))));
  app.use('/uploads/table-qrs', expressStatic(resolve(config.get<string>('UPLOAD_TABLE_QRS_DIR', 'uploads/table-qrs'))));

  const origins = config.get<string>('CORS_ORIGINS', 'http://localhost:5173, http://192.168.1.17:5173').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean);
  app.enableCors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: '*', credentials: true });

  await app.listen(Number(config.get<string>('PORT', '8080')), '0.0.0.0');
}
void bootstrap();
