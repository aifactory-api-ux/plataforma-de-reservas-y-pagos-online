import { IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservaDto {
  @IsNumber()
  @IsNotEmpty()
  jugadorId: number;

  @IsNumber()
  @IsNotEmpty()
  canchaId: number;

  @IsNumber()
  @IsNotEmpty()
  tarifaId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  inicio: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fin: Date;
}