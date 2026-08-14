import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PasswordDto } from './dto/password.dto';
import { EmailDto } from './dto/email.dto';
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

    //l'utilisateur modify le mot de passe
    async   password(passwordDto: PasswordDto)
    {
        if (passwordDto.newPass === passwordDto.verifNewPass && passwordDto.newPass !== passwordDto.lastPass)
            return {
                success: true,
                message: "Password Modify"
            }
        throw new BadRequestException("Incorrect Password");
    }

    //l'utilisateur modify le mot de passe
    async   email(emailDto: EmailDto)
    {
        if (emailDto.newEmail !== emailDto.lastEmail)
            return {
                success: true,
                message: "Email Modify"
            }
        throw new BadRequestException("Incorrect Password");
    }

}