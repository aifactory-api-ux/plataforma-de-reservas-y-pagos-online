import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const SERVICE_NAME = 'pagos-service';
const SERVICE_VERSION = '1.0.0';
const SERVICE_PORT = 23003;

function loadConfig() {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'WEBPAY_URL',
    'WEBPAY_COMMERCE_CODE',
    'WEBPAY_API_KEY',
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'WHATSAPP_BUSINESS_URL',
    'WHATSAPP_BUSINESS_TOKEN',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`Missing optional environment variables: ${missingVars.join(', ')}`);
  }

  return {
    database: {
      port: parseInt(process.env.DB_PORT || '5432', 10),
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'sporty',
    },
    webpay: {
      url: process.env.WEBPAY_URL || 'https://webpay3gint.transbank.cl',
      commerceCode: process.env.WEBPAY_COMMERCE_CODE || '597044444405',
      apiKey: process.env.WEBPAY_API_KEY || '',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@sporty.cl',
    },
    whatsapp: {
      url: process.env.WHATSAPP_BUSINESS_URL || '',
      token: process.env.WHATSAPP_BUSINESS_TOKEN || '',
    },
    app: {
      port: parseInt(process.env.APP_PORT || String(SERVICE_PORT), 10),
      environment: process.env.NODE_ENV || 'development',
      serviceName: SERVICE_NAME,
      serviceVersion: SERVICE_VERSION,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
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

  app.getHttpAdapter().get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/health"} 1
http_requests_total{method="GET",path="/health/ready"} 1
    `.trim());
  });

  await app.listen(config.app.port);
  console.log(`${SERVICE_NAME} is running on port ${config.app.port}`);
}

bootstrap();
