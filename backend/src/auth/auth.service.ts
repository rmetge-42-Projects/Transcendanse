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
            throw new UnauthorizedException("Incorrect email or password.");
        }

        const passwordMatches = await bcrypt.compare(pass, user.password);

        if (!passwordMatches)
        {
            throw new UnauthorizedException("Incorrect email or password.");
        }

        const payload = { id: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload);

        return {
            success: true,
            message: "Login successful !",
            access_token: token,
        };
    }

    //cree un nouvel utilisateur
    async   registerUser(email: string, pass: string, validPass: string)
    {
        if (pass !== validPass)
        {
            throw new UnauthorizedException("The passwords do not match.");
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser)
        {
            throw new UnauthorizedException("An account already exists with this email.");
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = await this.prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
            },
        });

        const payload = { id: newUser.id, email: newUser.email };
        const token = await this.jwtService.signAsync(payload);

        return {
            success: true,
            message: "Registration successful !",
            access_token: token,
        };
    }

    //l'utilisateur modifie le mot de passe
    async   password(passwordDto: PasswordDto)
    {
        if (passwordDto.newPass === passwordDto.verifNewPass && passwordDto.newPass !== passwordDto.lastPass)
            return {
                success: true,
                message: "The password has been changed."
            }
        throw new BadRequestException("Incorrect password.");
    }

    //l'utilisateur modifie le mot de passe
    async   email(emailDto: EmailDto)
    {
        if (emailDto.newEmail !== emailDto.lastEmail)
            return {
                success: true,
                message: "The email has been changed."
            }
        throw new BadRequestException("Incorrect email.");
    }

}