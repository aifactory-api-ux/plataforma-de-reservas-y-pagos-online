import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DatabaseConfig {
  @IsNumber()
  port: number;

  @IsString()
  host: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}

class JwtConfig {
  @IsString()
  secret: string;

  @IsString()
  refreshSecret: string;

  @IsNumber()
  expiresIn: number;

  @IsNumber()
  refreshExpiresIn: number;
}

class GoogleConfig {
  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;

  @IsString()
  callbackUrl: string;
}

class SendGridConfig {
  @IsString()
  apiKey: string;

  @IsString()
  fromEmail: string;
}

class AppConfig {
  @IsNumber()
  port: number;

  @IsString()
  environment: string;

  @IsString()
  serviceName: string;

  @IsString()
  serviceVersion: string;
}

export class EnvironmentConfig {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  database: DatabaseConfig;

  @ValidateNested()
  @Type(() => JwtConfig)
  jwt: JwtConfig;

  @ValidateNested()
  @Type(() => GoogleConfig)
  google: GoogleConfig;

  @ValidateNested()
  @Type(() => SendGridConfig)
  sendgrid: SendGridConfig;

  @ValidateNested()
  @Type(() => AppConfig)
  app: AppConfig;
}
