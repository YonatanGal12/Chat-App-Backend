import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'
import { DatabaseService } from './database/database.service';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    method: 'GET,POST,PATCH,DELETE,PUT',
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
