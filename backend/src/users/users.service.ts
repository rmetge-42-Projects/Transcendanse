import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { StatusDto } from './dto/status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MessageGateway } from '../message/message.gateway';

@Injectable()
export class UsersService {

    constructor(
    private prisma: PrismaService,
    private messageGateway: MessageGateway,
    ) {}

    private checkUsernameError(error: any): never {
    if (error.code === 'P2002') {
        throw new ConflictException("Ce nom d'utilisateur est déjà pris.");
    }
    throw error;
    }

    private validatePhoto(photo?: string | null) {
        if (photo === undefined || photo === null || photo === '') {
            return;
        }

        const maxPhotoSize = 5_000_000;
        const isDataImage = /^data:image\/(png|jpeg|jpg|webp);base64,[a-zA-Z0-9+/=]+$/.test(photo);
        const isLocalUpload = photo.startsWith('/uploads/');
        const isBundledAvatar = photo.startsWith('/test-avatars/');

        if (photo.length > maxPhotoSize) {
            throw new BadRequestException("L'avatar ne peut pas dépasser 5 Mo.");
        }

        if (!isDataImage && !isLocalUpload && !isBundledAvatar) {
            throw new BadRequestException("Format d'avatar invalide.");
        }
    }
	
   async createProfile(userId: number, createDto: CreateDto, photoPath?: string) {
		this.validatePhoto(photoPath || createDto.photo || null);
		const finalPhoto = photoPath || createDto.photo || null;
		const profile = await this.prisma.user.update({
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

        return profile;
	}
	

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
            if (!match || !match.isActive) {
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
                isOnline: true,
            },
        });

        if (!user) {
            throw new NotFoundException("Utilisateur introuvable.");
        }

        return user;
    }

    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        try{
        this.validatePhoto(updateProfileDto.photo);
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

        if (updateProfileDto.kind !== undefined || updateProfileDto.orientation !== undefined) {
            this.messageGateway.notifySuggestionsChanged();
        }
        return updatedUser;
        } catch (error) {
            this.checkUsernameError(error);
        }
    }

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
