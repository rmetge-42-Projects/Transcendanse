import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto{

    @IsString()
    @IsEmail({}, { message: "Format d'email invalide." })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

}