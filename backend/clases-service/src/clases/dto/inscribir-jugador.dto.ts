import { IsNumber, IsNotEmpty } from 'class-validator';

export class InscribirJugadorDto {
  @IsNumber()
  @IsNotEmpty()
  jugadorId: number;
}