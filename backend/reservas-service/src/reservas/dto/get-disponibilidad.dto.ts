import { IsNumber, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDisponibilidadDto {
  @IsNumber()
  @IsOptional()
  sedeId?: number;

  @IsString()
  @IsOptional()
  deporte?: 'padel' | 'futbol7';

  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @IsOptional()
  @IsString()
  franja?: 'manana' | 'tarde' | 'noche';
}