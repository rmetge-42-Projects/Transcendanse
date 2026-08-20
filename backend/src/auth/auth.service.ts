// verifie, creer le user et genere le token JWT

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    ) {}

    async validateUser(email: string, pass: string)
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

    async registerUser(email: string, pass: string, validPass: string)
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

    async   createProfile(name: string, username: string, birthday: Date, kind: string, orientation: string, biography: string)
    {
        return {
            success: true,
            message: "Profile Create !"
        }
    }
}