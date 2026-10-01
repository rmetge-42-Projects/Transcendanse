import {IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateDto{

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @Type(()=> Date)
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
    @IsOptional()
    biography!: string

    @IsString()
    @IsOptional()
    photo?: string;
}