import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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
   async createProfile(userId: number, createDto: CreateDto, photoPath?: string) {
		const finalPhoto = photoPath || createDto.photo || null;
		return await this.prisma.user.update({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				name: true,
				photo: true,
				createdAt: true,
			},
			data: {
				name: createDto.name,
				username: createDto.username,
				birthday: createDto.birthday,
				kind: createDto.kind,
				orientation: createDto.orientation,
				biography: createDto.biography,
				photo: finalPhoto,
			},
		});
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
                photo: true,
				twoFactorEnabled: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }
        return user;
    }

    //envoie les info de l'utilisateur (userId) - sert a afficher le profil du match
    async myMatchProfile(currentUserId: number, targetUserId: number){
        if (currentUserId !== targetUserId) {
            const blocked = await this.prisma.block.findFirst({
                where: {
                    OR: [
                        { blockerId: currentUserId, blockedId: targetUserId },
                        { blockerId: targetUserId, blockedId: currentUserId },
                    ],
                },
            });
            if (blocked) {
                throw new NotFoundException("Utilisateur introuvable.");
            }

            const user1Id = Math.min(currentUserId, targetUserId);
            const user2Id = Math.max(currentUserId, targetUserId);
            const match = await this.prisma.match.findUnique({
                where: { user1Id_user2Id: { user1Id: user1Id, user2Id: user2Id } },
            });
            if (!match) {
                throw new NotFoundException("Utilisateur introuvable.");
            }
        }

        const user = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                createdAt: true,
                name: true,
                username: true,
                birthday: true,
                kind: true,
                orientation: true,
                biography: true,
                photo: true,
            },
        });

        if (!user) {
            throw new NotFoundException("Utilisateur introuvable.");
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
                photo: true,
            },
            data: {
                ...(updateProfileDto.username !== undefined && { username: updateProfileDto.username }),
                ...(updateProfileDto.kind !== undefined && { kind: updateProfileDto.kind }),
                ...(updateProfileDto.orientation !== undefined && { orientation: updateProfileDto.orientation }),
                ...(updateProfileDto.biography !== undefined && { biography: updateProfileDto.biography }),
                ...(updateProfileDto.photo !== undefined && { photo: updateProfileDto.photo }),
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