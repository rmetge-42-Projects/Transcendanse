import {IsNotEmpty, IsString } from "class-validator";

export class EmailDto{

    @IsString()
    @IsNotEmpty()
    lastEmail!: string;

    @IsString()
    @IsNotEmpty()
    newEmail!: string
}