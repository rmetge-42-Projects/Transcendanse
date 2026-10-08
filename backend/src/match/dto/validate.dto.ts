import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';

export class ValidateDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['like', 'reject'])
  status!: string;
}
