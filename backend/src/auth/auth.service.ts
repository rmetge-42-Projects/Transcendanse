
import { MessageGateway } from '../message/message.gateway';
import {BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PasswordDto } from './dto/password.dto';
import { EmailDto } from './dto/email.dto';
import { generateSecret, generateURI, verify } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private readonly messageGateway: MessageGateway,
    ) {}

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

            if (user.twoFactorEnabled)
            {
                return {
                    success: false,
                    message: "2FA required",
                };
            }

            const payload = { id: user.id, email: user.email, version: user.sessionVersion };
            const token = await this.jwtService.signAsync(payload);

            return {
                success: true,
                message: "Connexion réussie !",
                access_token: token,
            };
    }

    async   registerUser(email: string, pass: string, validPass: string)
    {
        if (pass !== validPass)
        {
            throw new BadRequestException("Les mots de passe ne correspondent pas.");
        }

        if (pass.length < 8)
        {
            throw new BadRequestException("Le mot de passe doit contenir au moins 8 caractères.");
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser)
        {
            throw new ConflictException("Un compte existe déjà avec cet email.");
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = await this.prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
            },
        }).catch((error) => {
            if (error.code === 'P2002') throw new ConflictException("Un compte existe déjà avec cet email.");
            throw error;
        });

        const payload = { id: newUser.id, email: newUser.email, version: newUser.sessionVersion };
        const token = await this.jwtService.signAsync(payload);

        return {
            success: true,
            message: "Inscription réussie !",
            access_token: token,
        };
    }

    async   password(userId: number, passwordDto: PasswordDto)
    {
        if (passwordDto.newPass !== passwordDto.verifNewPass)
        {
            throw new BadRequestException("Les nouveaux mots de passe ne correspondent pas.");
        }

        if (passwordDto.newPass.length < 8)
        {
            throw new BadRequestException("Le mot de passe doit contenir au moins 8 caractères.");
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
        {
            throw new NotFoundException("Utilisateur introuvable.");
        }

        const passwordMatches = await bcrypt.compare(passwordDto.lastPass, user.password);
        if (!passwordMatches)
        {
            throw new BadRequestException("L'ancien mot de passe est incorrect.");
        }

        if (passwordDto.newPass === passwordDto.lastPass)
        {
            throw new BadRequestException("Le nouveau mot de passe doit être différent de l'ancien.");
        }

        const hashedPassword = await bcrypt.hash(passwordDto.newPass, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword, sessionVersion: { increment: 1 } },
        });

        this.messageGateway.server.in(`user_${userId}`).disconnectSockets(true);
        return {
            success: true,
            message: "Le mot de passe a été modifié."
        }
    }


    async   email(userId: number, emailDto: EmailDto)
    {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
        {
            throw new NotFoundException("Utilisateur introuvable.");
        }

        if (emailDto.lastEmail !== user.email)
        {
            throw new BadRequestException("L'ancien email est incorrect.");
        }

        if (emailDto.newEmail === emailDto.lastEmail)
        {
            throw new BadRequestException("Le nouvel email doit être différent de l'ancien.");
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: emailDto.newEmail },
        });
        if (existingUser)
        {
            throw new ConflictException("Un compte existe déjà avec cet email.");
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { email: emailDto.newEmail },
        }).catch((error) => {
            if (error.code === 'P2002') throw new ConflictException("Un compte existe déjà avec cet email.");
            throw error;
        });

        return {
            success: true,
            message: "L'email a été modifié."
        }
    }


    async generateTwoFactorSecret(userId: number)
    {
        const secret = generateSecret();

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            select: { id: true },
            data: { twoFactorSecret: secret },
        });

        const otpauthUrl = generateURI({
            issuer: 'ChiFouMi',
            label: String(userId),
            secret: secret,
            });
    
        const qrCodeImage = await qrcode.toDataURL(otpauthUrl);

        return { qrCodeImage };
    }

    async disableTwoFactor(userId: number) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        return { message: '2FA désactivée avec succès' };
    }
    

    async confirmTwoFactor(userId: number, token: string)
    {
        const user = await this.prisma.user.findUnique({
        where: { id: userId },
        });

        if (!user)
            throw new NotFoundException("Utilisateur introuvable.");

        if (!user.twoFactorSecret)
            throw new BadRequestException("La double authentification n'a pas encore été initialisée pour cet utilisateur.");

        const result = await verify({ secret: user.twoFactorSecret, token });

        if (result.valid)
        {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                select: { id: true },
                data: { twoFactorEnabled: true},
            });

            return true;
        }
        else
            throw new BadRequestException("Code incorrect.");
    }

    async verifyTwoFactorLogin(email: string, token: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            throw new UnauthorizedException("Email ou mot de passe incorrect.");
        }

        if (!user.twoFactorSecret) {
            throw new BadRequestException("La double authentification n'est pas activée pour cet utilisateur.");
        }

        const result = await verify({ secret: user.twoFactorSecret, token });

        if (!result.valid) {
            throw new BadRequestException("Code incorrect.");
        }

        const payload = { id: user.id, email: user.email, version: user.sessionVersion };
        const JWTtoken = await this.jwtService.signAsync(payload);

        return {
            success: true,
            message: "Connexion réussie !",
            access_token: JWTtoken,
        };
    }
}
