import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:4200'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('wibotodo API')
    .setDescription('Todo list with date filtering and image upload')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = Number(config.get<string>('PORT', '3000'));
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`✓ Backend running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`✓ Swagger docs at http://localhost:${port}/api`);
}

void bootstrap();
