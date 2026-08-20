import {IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";

export class PasswordDto{

    @IsString()
    @IsNotEmpty()
    lastPass!: string;

    @IsString()
    @IsNotEmpty()
    newPass!: string
    
    @IsString()
    @IsNotEmpty()
    verifNewPass!: string
}