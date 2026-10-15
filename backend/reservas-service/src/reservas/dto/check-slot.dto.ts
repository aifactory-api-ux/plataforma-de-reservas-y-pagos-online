import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CheckSlotDisponibilidadDto {
  @IsNumber()
  @IsNotEmpty()
  canchaId: number;

  @IsString()
  @IsNotEmpty()
  inicio: string;

  @IsString()
  @IsNotEmpty()
  fin: string;
}