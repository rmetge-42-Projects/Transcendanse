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
  async createProfile(userId: number, createDto: CreateDto) {
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
  }

  //modifier les info du profil (ex: username, bio ...) dans la db
  async modifyProfile(userId: number, updateProfileDto: UpdateProfileDto)
  {
      const updatedUser = await this.prisma.user.update({
          where: { id: userId },
          select: { id: true, email: true, createdAt: true },
          data: {
              username: updateProfileDto.username,
              kind: updateProfileDto.kind,
              orientation: updateProfileDto.orientation,
              biography: updateProfileDto.biography,
          },
      });
      return updatedUser;
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
              select: { id: true, name: true, username: true, createdAt: true, kind: true, orientation: true, birthday: true, biography: true },
          });
      } else {
          others = await this.prisma.user.findMany({
              where: {
                  id: { not: userId },
                  kind: currentUser.orientation,
              },
              select: { id: true, name: true, username: true, createdAt: true, kind: true, orientation: true, birthday: true, biography: true },
          });
      }

      return others;
  }

  //envoie les info de l'utilisateur (userId) - sert a afficher le profile du match
  //PAS ENCORE CONNECTE A PRISMA - a faire ensemble prochainement
  myMatchProfile(userId: number){
    return {
      id: userId,
      username: 'sophie',
      email: 'norminet@student.42.fr',
      birthday: 12/12/2005,
      kind: 'man',
      orientation: 'all',
      biography: 'Étudiant à 42 en plein sur Transcendence !',
    };
  }

  //met a jour le profil en une seule fois
  //PAS ENCORE CONNECTE A PRISMA - a faire ensemble prochainement, probablement redondant avec modifyProfile
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    return {
      success: true,
      message: "Profile updated (simulation)"
    };
  }

  //mettre onLine a false (ou true)
  status(status: boolean) {
    return {
      success: true,
      message: "Status hors ligne"
    }
  }
}