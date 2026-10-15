import { IsNumber, IsDate, IsNotEmpty, IsString, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClaseDto {
  @IsNumber()
  @IsNotEmpty()
  canchaId: number;

  @IsNumber()
  @IsNotEmpty()
  profesorId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  inicio: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fin: Date;

  @IsString()
  @IsNotEmpty()
  @Max(100)
  nombre: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  cupos: number;

  @IsNumber()
  @Min(0)
  precio: number;
}