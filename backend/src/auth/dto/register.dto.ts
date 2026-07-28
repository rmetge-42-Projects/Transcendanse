import { LoginDto } from "./login.dto";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto extends LoginDto{
    @IsString()
    @IsNotEmpty()
    validatePassword!: string;
}