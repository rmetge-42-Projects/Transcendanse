import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class EmailDto{

    @IsString()
    @IsNotEmpty({ message: "L'ancien email est obligatoire." })
    lastEmail!: string;

    @IsEmail({}, { message: "Format d'email invalide." })
    @IsNotEmpty({ message: "Le nouvel email est obligatoire." })
    newEmail!: string
}