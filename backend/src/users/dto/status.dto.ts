import {IsNotEmpty, IsBoolean} from "class-validator";

export class StatusDto{
    @IsBoolean()
    @IsNotEmpty()
    isOnline!: boolean;
}