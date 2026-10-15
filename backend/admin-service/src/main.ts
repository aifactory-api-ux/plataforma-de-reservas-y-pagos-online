import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const SERVICE_NAME = 'admin-service';
const SERVICE_VERSION = '1.0.0';

function loadConfig() {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'APP_PORT',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  return {
    database: {
      port: parseInt(process.env.DB_PORT || '5432', 10),
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'sporty',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'sporty-secret-key',
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
    },
    app: {
      port: parseInt(process.env.APP_PORT || '23006', 10),
      environment: process.env.NODE_ENV || 'development',
      serviceName: SERVICE_NAME,
      serviceVersion: SERVICE_VERSION,
    },
  };
}

async function bootstrap() {
  const config = loadConfig();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

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

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: config.app.serviceName,
      version: config.app.serviceVersion,
    });
  });

  app.getHttpAdapter().get('/health/ready', (req, res) => {
    res.json({
      status: 'ready',
      service: config.app.serviceName,
      version: config.app.serviceVersion,
    });
  });

  await app.listen(config.app.port);
  console.log(`${SERVICE_NAME} is running on port ${config.app.port}`);
}

bootstrap();
