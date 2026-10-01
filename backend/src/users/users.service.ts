import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {

    constructor(
    private prisma: PrismaService,
    ) {}

    //implemente les infos du nouvel utilisateur dans la db
    // async createProfile(userId: number, createDto: CreateDto) {
    //     const updatedUser = await this.prisma.user.update({
    //         where: { id: userId },
    //         select: { id: true, email: true, createdAt: true/*, photo: true */},
    //         data: {
    //             name: createDto.name,
    //             username: createDto.username,
    //             birthday: createDto.birthday,
    //             kind: createDto.kind,
    //             orientation: createDto.orientation,
    //             biography: createDto.biography,
    //             // photo: createDto.photo,
    //         },
    //     });
    //     return updatedUser;
    // }

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
            },
        });

        if (!user) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }
        return user;
    }

    //envoie les infos des profils des matchs
    async getOtherProfile(userId: number) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }

        let others;

        if (currentUser.orientation === 'all') {
            others = await this.prisma.user.findMany({
                where: {
                    id: { not: userId },
                },
                select: { 
                    id: true,
                    name: true,
                    username: true,
                    createdAt: true,
                    kind: true,
                    orientation: true,
                    birthday: true,
                    biography: true,
                    photo: true,
                },
            });
        } else {
            others = await this.prisma.user.findMany({
                where: {
                    id: { not: userId },
                    kind: currentUser.orientation,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    createdAt: true,
                    kind: true,
                    orientation: true,
                    birthday: true,
                    biography: true,
                    photo: true,
                },
            });
        }
        return others;
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
                photo: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Utilisateur introuvable.");
        }
        return user;
    }

    //met a jour le profil en une seule fois
    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
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
    }

  //mettre onLine a false (ou true)
    status(status: boolean) {
        return {
            success: true,
            message: "Status hors ligne"
        }
    }
}