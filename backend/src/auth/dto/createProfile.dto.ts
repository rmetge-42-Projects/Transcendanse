import {IsNotEmpty, IsString, IsDate } from "class-validator";

export class CreateDto{

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsDate()
    @IsNotEmpty()
    birthday!: Date;

    @IsString()
    @IsNotEmpty()
    kind!: string
    
    @IsString()
    @IsNotEmpty()
    orientation!: string
    
    @IsString()
    biography!: string
}