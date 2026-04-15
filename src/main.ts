import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const LOCAL_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function normalizarOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
}

function obtenerCorsOrigins() {
  const envOrigins =
    process.env.CORS_ORIGINS?.split(',')
      .map((origin) => normalizarOrigin(origin))
      .filter(Boolean) ?? [];

  const selfOrigins = [
    process.env.RENDER_EXTERNAL_URL,
    process.env.BACKEND_PUBLIC_URL,
  ]
    .filter(Boolean)
    .map((origin) => normalizarOrigin(origin!));

  return [...new Set([...LOCAL_CORS_ORIGINS, ...selfOrigins, ...envOrigins])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = obtenerCorsOrigins();

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MediAlert API')
    .setDescription('Plataforma de reservas médicas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? process.env.APP_PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
