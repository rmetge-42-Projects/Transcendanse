import {IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";

export class ModifyPasswordDto{

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