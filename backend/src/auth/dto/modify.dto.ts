import {IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class ModifyDto{

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    kind!: string
    
    @IsString()
    @IsNotEmpty()
    orientation!: string
    
    @IsString()
    @IsOptional()
    biography!: string
}