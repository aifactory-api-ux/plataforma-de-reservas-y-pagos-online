import { IsBoolean, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConsentDto {
  @IsBoolean()
  @IsNotEmpty()
  aceptado: boolean;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
