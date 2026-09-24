import {IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendMessageDto{

    @IsNumber()
    @IsNotEmpty()
    receiveId!: number;

    @IsNotEmpty()
    @IsString()
    message!: string;
}