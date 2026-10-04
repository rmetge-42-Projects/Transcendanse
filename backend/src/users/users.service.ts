import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { StatusDto } from './dto/status.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {

    constructor(
    private prisma: PrismaService,
    ) {}

    //verifie si il y a un doublon de username
    private checkUsernameError(error: any): never {
    if (error.code === 'P2002') {
        throw new ConflictException("Ce nom d'utilisateur est déjà pris.");
    }
    throw error;
    }
    //implemente les infos du nouvel utilisateur dans la db
    async createProfile(userId: number, createDto: CreateDto) {

        try {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true },
            data: {
                name: createDto.name,
                username: createDto.username,
                birthday: createDto.birthday,
                kind: createDto.kind,
                orientation: createDto.orientation,
                biography: createDto.biography,
            },
        });
        return updatedUser;
        } catch (error) {
            this.checkUsernameError(error);
        }
    }
    

    //envoie les infos de l'utilisateur
    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                name: true,
                username: true,
                birthday: true,
                kind: true,
                orientation: true,
                biography: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }
        return user;
    }

    //envoie les info de l'utilisateur (userId) - sert a afficher le profil du match
    async myMatchProfile(userId: number){
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                name: true,
                username: true,
                birthday: true,
                kind: true,
                orientation: true,
                biography: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }
        return user;
    }

    //met a jour le profil en une seule fois
    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        try{
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                name: true,
                username: true,
                birthday: true,
                kind: true,
                orientation: true,
                biography: true,
            },
            data: {
                username: updateProfileDto.username,
                kind: updateProfileDto.kind,
                orientation: updateProfileDto.orientation,
                biography: updateProfileDto.biography,
            },
        });
        return updatedUser;
        } catch (error) {
            this.checkUsernameError(error);
        }
    }

  //mettre onLine a false (ou true)
    async status(userId: number, statusDto: StatusDto) {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: statusDto.isOnline,
            },
        });
        return {
            success: true,
            message: statusDto.isOnline ? "Status en ligne" : "Status hors ligne",
        };
    }
}