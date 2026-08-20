import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class ValideteDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
