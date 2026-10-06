import { IsNotEmpty, IsString, IsDate, IsOptional, IsIn, MinLength, MaxLength, Matches } from "class-validator";
import { Type } from "class-transformer";

export class CreateDto{

    @IsString({ message: "Le nom doit être du texte." })
    @IsNotEmpty({ message: "Le nom est obligatoire." })
    @MaxLength(50, { message: "Le nom ne peut pas dépasser 50 caractères." })
    name!: string;

    @IsString({ message: "Le nom d'utilisateur doit être du texte." })
    @IsNotEmpty({ message: "Le nom d'utilisateur est obligatoire." })
    @MinLength(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères." })
    @MaxLength(20, { message: "Le nom d'utilisateur ne peut pas dépasser 20 caractères." })
    @Matches(/^[a-zA-Z0-9_]+$/, { message: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des _." })
    username!: string;

    @Type(()=> Date)
    @IsDate({ message: "La date de naissance est invalide." })
    @IsNotEmpty({ message: "La date de naissance est obligatoire." })
    birthday!: Date;

    @IsString()
    @IsNotEmpty({ message: "Le genre est obligatoire." })
    @IsIn(['man', 'woman', 'non_binary'], { message: "Genre invalide." })
    kind!: string
    
    @IsString()
    @IsNotEmpty({ message: "L'orientation est obligatoire." })
    @IsIn(['man', 'woman', 'all'], { message: "Orientation invalide." })
    orientation!: string

    @IsString()
    @IsOptional()
    @MaxLength(500, { message: "La biographie ne peut pas dépasser 500 caractères." })
    biography!: string

    @IsString()
    @IsOptional()
    photo?: string;
}