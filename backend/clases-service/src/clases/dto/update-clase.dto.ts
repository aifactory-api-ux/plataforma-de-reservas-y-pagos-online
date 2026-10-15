import { IsNumber, IsDate, IsString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClaseDto {
  @IsString()
  @IsOptional()
  @Max(100)
  nombre?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  inicio?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fin?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  cupos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  precio?: number;
}