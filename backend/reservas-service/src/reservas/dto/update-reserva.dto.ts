import { IsOptional, IsNumber, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReservaDto {
  @IsOptional()
  @IsString()
  estado?: 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  confirmadaEn?: Date | null;
}