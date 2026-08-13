import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyProfileDto } from './dto/modifyProfile.dto';
import { ModifyPasswordDto } from './dto/modifyPassword.dto';
//autentification

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService){}

    //verifie si l'utilisateur existe
    async   validateUser(email: string, pass: string) 
    {
        if (email === 'test@test.com' && pass === '123456')
        {
            const user = {
                id: 1,
                email: email,
                nom: "Utilisateur Test"
            }
            const   playload = {id: user.id, email: user.email};
            const   token = await this.jwtService.signAsync(playload);
            return {
                success: true,
                message: "Connexion réussie !",
                access_token: token,

            };
        }
        throw new UnauthorizedException("Email ou mot de passe incorrect.");
    }

    //cree un nouvelle utilisateur
    async   registerUser(email: string, pass: string, validPass: string)
    {
        if (pass === validPass)
        {
            const user = {
                id: 2,
                email: email,
                nom: "Utilisateur Test register"
            }
            const   playload = {id: user.id, email: user.email};
            const   token = await this.jwtService.signAsync(playload);
            return {
                success: true,
                message: "Connexion réussie !",
                access_token: token,

            };
        }
        throw new UnauthorizedException("Email ou mot de passe incorrect.");
        
    }

    //ressegne les info du nouvelle utilisateur
    async   createProfile(createDto: CreateDto)
    {
        return {
            success: true,
            message: "Profile Create !"
        }
    }

    //modifier les info du profile (ex: username, bio ...)
    async   modifyProfile(modifyProfileDto: ModifyProfileDto)
    {
        return {
            success: true,
            message: "Profile Modify"
        }
    }

    //l'utilisateur modify le mot de passe
    async   modifyPassword(modifyPasswordDto: ModifyPasswordDto)
    {
        if (modifyPasswordDto.newPass === modifyPasswordDto.verifNewPass && modifyPasswordDto.newPass !== modifyPasswordDto.lastPass)
            return {
                success: true,
                message: "Password Modify"
            }
        throw new UnauthorizedException("Incorrect Password");
    }
}