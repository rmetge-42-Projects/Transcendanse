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
  async   createProfile(createDto: CreateDto)
  {
    return {
      success: true,
      message: "Profile Create !"
    }
  }
  //modifier les info du profile (ex: username, bio ...) dans la db
  async   modifyProfile(modifyProfileDto: ModifyProfileDto)
  {
    return {
      success: true,
      message: "Profile Modify"
    }
  }

  //envoie les info de l'utilisateur
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

  //envoie les infos des profil des match
  getOtherProfile() {
    return {
      id: 12,
      username: 'match',
      kind: 'woman',
      orientation: 'man',
      biography: 'j\'aime les fleur',
    };
  }
}