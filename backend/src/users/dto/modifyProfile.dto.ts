import {IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";

export class ModifyProfileDto{

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