import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger: Logger = new Logger('Bootstrap');

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', '*'], // frontend origin(s)
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for my E-Commerce Project')
    .setVersion('1.0')
    // .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
  logger.log(`Application running on http://localhost:${process.env.PORT}`);
  logger.log(`Swagger running on http://localhost:${process.env.PORT}/api`);
}
bootstrap();
