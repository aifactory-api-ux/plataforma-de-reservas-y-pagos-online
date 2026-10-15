import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class StaffLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
