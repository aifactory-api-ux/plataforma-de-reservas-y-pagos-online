import { IsNumber, IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReservaPresencialDto {
  @IsString()
  @IsNotEmpty()
  jugadorNombre: string;

  @IsString()
  @IsNotEmpty()
  jugadorTelefono: string;

  @IsOptional()
  @IsString()
  jugadorEmail?: string;

  @IsNumber()
  @IsNotEmpty()
  canchaId: number;

  @IsNumber()
  @IsNotEmpty()
  tarifaId: number;

  @IsString()
  @IsNotEmpty()
  inicio: string;

  @IsString()
  @IsNotEmpty()
  fin: string;

  @IsBoolean()
  esPagoManual: boolean;
}