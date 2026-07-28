import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService 
{
    constructor(private jwtService: JwtService){}
    
    async validateUser(email: string, pass: string) 
    {
        if (email === 'test@test.com' && pass === '123456')
        {
            const user = {
                id: 1,
                email: email,
                nom: 'Utilisateur Test'
            }
            const   playload = {id: user.id, email: user.email};
            const   token = await this.jwtService.signAsync(playload);
            return {
                success: true,
                message: 'Connexion réussie !',
                access_token: token,

            };
        }
        // return {
        //     success: false,
        //     message: 'Email ou mot de passe incorrect.',
        // };
        throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }
}

