import { IsNotEmpty, IsInt, IsString, MaxLength, Matches } from "class-validator";

export class SendMessageDto{

    @IsInt({ message: "Destinataire invalide." })
    @IsNotEmpty()
    receiveId!: number;

    @IsString()
    @IsNotEmpty({ message: "Le message ne peut pas être vide." })
    @Matches(/\S/, { message: "Le message ne peut pas être vide." })
    @MaxLength(1000, { message: "Le message ne peut pas dépasser 1000 caractères." })
    message!: string;
}