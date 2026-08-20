// verifie, creer le user et genere le token JWT

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PasswordDto } from './dto/password.dto';
import { EmailDto } from './dto/email.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    ) {}

    //verifie si l'utilisateur existe
    async   validateUser(email: string, pass: string)
    {
        const user = await this.prisma.user.findUnique({
            where: { email: email },
    });

    if (!user)
        {
            throw new UnauthorizedException("Email ou mot de passe incorrect.");
        }

        const passwordMatches = await bcrypt.compare(pass, user.password);

        if (!passwordMatches)
        {
            throw new UnauthorizedException("Email ou mot de passe incorrect.");
        }

        const playload = { id: user.id, email: user.email };
        const token = await this.jwtService.signAsync(playload);

        return {
            success: true,
            message: "Connexion réussie !",
            access_token: token,
        };
    }

    //cree un nouvelle utilisateur
    async   registerUser(email: string, pass: string, validPass: string)
    {
        if (pass !== validPass)
        {
            throw new UnauthorizedException("Les mots de passe ne correspondent pas.");
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser)
        {
            throw new UnauthorizedException("Un compte existe déjà avec cet email.");
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = await this.prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
            },
        });

        const playload = { id: newUser.id, email: newUser.email };
        const token = await this.jwtService.signAsync(playload);

        return {
            success: true,
            message: "Inscription réussie !",
            access_token: token,
        };
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