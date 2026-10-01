import { IsString, IsOptional } from "class-validator";

export class UpdateProfileDto{

    @IsString()
    @IsOptional()
    username!: string;

    @IsString()
    @IsOptional()
    kind!: string
    
    @IsString()
    @IsOptional()
    orientation!: string
    
    @IsString()
    @IsOptional()
    biography!: string

    @IsString()
    @IsOptional()
    photo?: string
}