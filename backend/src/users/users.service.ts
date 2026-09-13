import { Injectable } from '@nestjs/common';
import { CreateDto } from './dto/createProfile.dto';
import { ModifyProfileDto } from './dto/modifyProfile.dto';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class UsersService {

    constructor(
    private prisma: PrismaService,
    ) {}
  //implemente les info du nouvelle utilisateur dans la db
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

  //modifier les info du profile (ex: username, bio ...) dans la db
  async   modifyProfile(userId: number, modifyProfileDto: ModifyProfileDto)
  {
      const updatedUser = await this.prisma.user.update({
          where: { id: userId },
          select: { id: true, email: true, createdAt: true },
          data: {
              username: modifyProfileDto.username,
              kind: modifyProfileDto.kind,
              orientation: modifyProfileDto.orientation,
              biography: modifyProfileDto.biography,
          },
      });
      return updatedUser;
  }

  //envoie les infos de l'utilisateur
  async getProfile(userId: number) {
      const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, createdAt: true },
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
}