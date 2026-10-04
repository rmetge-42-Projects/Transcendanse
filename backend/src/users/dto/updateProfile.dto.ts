import { IsString, IsOptional, IsIn, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateProfileDto{

    @IsOptional()
    @IsString({ message: "Le nom d'utilisateur doit être du texte." })
    @MinLength(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères." })
    @MaxLength(20, { message: "Le nom d'utilisateur ne peut pas dépasser 20 caractères." })
    @Matches(/^[a-zA-Z0-9_]+$/, { message: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des _." })
    username!: string;

    @IsOptional()
    @IsString({ message: "Le genre est invalide." })
    @IsIn(['man', 'woman', 'non_binary'], { message: "Genre invalide." })
    kind!: string

    @IsOptional()
    @IsString({ message: "L'orientation est invalide." })
    @IsIn(['man', 'woman', 'all'], { message: "Orientation invalide." })
    orientation!: string

    @IsOptional()
    @IsString({ message: "La biographie doit être du texte." })
    @MaxLength(500, { message: "La biographie ne peut pas dépasser 500 caractères." })
    biography!: string
}