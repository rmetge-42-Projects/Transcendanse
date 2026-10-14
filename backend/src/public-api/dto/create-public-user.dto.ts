import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePublicUserDto {
  @IsEmail({}, { message: "Format d'email invalide." })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  @MaxLength(128, { message: 'Le mot de passe est trop long.' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username?: string;

  @IsOptional()
  @IsString()
  @IsIn(['man', 'woman', 'non_binary'])
  kind?: string;

  @IsOptional()
  @IsString()
  @IsIn(['man', 'woman', 'all'])
  orientation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  biography?: string;
}
