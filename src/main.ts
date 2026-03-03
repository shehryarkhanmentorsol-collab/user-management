import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
  await app.listen(port);
}
bootstrap();
