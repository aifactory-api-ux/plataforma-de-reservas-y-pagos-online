import { IsNumber, IsBoolean, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  reservaId: number;

  @IsNumber()
  montoTotal: number;

  @IsBoolean()
  @IsOptional()
  esParcial?: boolean;
}

export class CreatePagoSplitDto {
  @IsNumber()
  reservaId: number;

  @IsNumber()
  montoTotal: number;

  @IsNumber()
  @Min(2)
  @Max(4)
  cantidadJugadores: number;
}

export class ConfirmarPagoDto {
  @IsNumber()
  reservaId: number;

  @IsNumber()
  @IsOptional()
  montoRecibido?: number;
}

export class SolicitarDevolucionDto {
  @IsNumber()
  pagoId: number;

  @IsNumber()
  autorizadoPorId: number;

  @IsNumber()
  monto: number;

  @IsString()
  @IsOptional()
  motivo?: string;
}
