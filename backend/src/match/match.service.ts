import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateDto } from './dto/validate.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  //valide ou non le profile de mach et dire si on a un match
  async rejected(currentUserId: number, validateDto: ValidateDto) {
    if (validateDto.status === 'reject') {
      //userId est le numero de profil liker ou non
      return {
        success: true,
        message: 'Profile Reject !',
      };
    }
    else if (validateDto.status === 'like') {

      //est ce que le user que j'ai like est moi?
      if (currentUserId === validateDto.userId) {
        throw new BadRequestException('Vous ne pouvez pas liker votre propre profil');
      }
      //est ce que j'ai deja like ce profil?
      const existingLike = await this.prisma.like.findUnique({where: {fromUserId_toUserId: {fromUserId: currentUserId,toUserId: validateDto.userId}}});
      //si oui je throw l'exception
      if (existingLike) {
        throw new BadRequestException('Vous avez déjà liké ce profil');
      }

      //sinon je cree un nouveau like dans mon tableau de like
      await this.prisma.like.create({data: {fromUserId: currentUserId, toUserId: validateDto.userId}});
      //je regarde si la personne que j'ai like m'a deja liker si oui isMatch = true
      const reverseLike = await this.prisma.like.findUnique({where: { fromUserId_toUserId: { fromUserId: validateDto.userId, toUserId: currentUserId}}});
      const isMatch = reverseLike !== null;

      //si isMatch = true je cree le match
      if (isMatch) {
        const user1Id = Math.min(currentUserId, validateDto.userId);
        const user2Id = Math.max(currentUserId, validateDto.userId);
        await this.prisma.match.create({data: {user1Id: user1Id,user2Id: user2Id}});
      }
      return {
        success: true,
        message: isMatch ? 'C\'est un Match !' : 'Profile Like !',
        match: isMatch,
      };
    } else {
      return {
        success: false,
        message: 'probleme',
      };
    }
  }

  //renvoit la liste des matchs
  async getMatches(currentUserId: number) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            kind: true,
            orientation: true,
            biography: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            kind: true,
            orientation: true,
            biography: true,
          },
        },
      },
    });
    const matchedProfiles = matches.map((match) => {
      if (match.user1.id === currentUserId) {
        return match.user2;
      }
      return match.user1;
    });
    return matchedProfiles;
  }

  //envoie les infos des profil des match
  //faire une pres selection (orientation sexuel ...)
  //pour faire les carte de match
  getOtherProfile() {
    return [
      {
        id: 12,
        username: 'Sophie',
        kind: 'woman',
        orientation: 'man',
        biography: 'Passionnée de danse contemporaine, de voyages et de bon café !',
      },
      {
        id: 13,
        username: 'Alexandre',
        kind: 'man',
        orientation: 'woman',
        biography: 'Danseur de salsa et grand amateur de musique électronique.',
      },
      {
        id: 14,
        username: 'Camille',
        kind: 'other',
        orientation: 'all',
        biography: 'Toujours partant pour tester de nouvelles chorégraphies et sorties.',
      },
      {
        id: 15,
        username: 'Lucas',
        kind: 'man',
        orientation: 'all',
        biography: 'Étudiant à 42, aime le tango, les échecs et le code propre.',
      },
      {
        id: 16,
        username: 'Léa',
        kind: 'woman',
        orientation: 'all',
        biography: 'Fan de hip-hop, de cuisine italienne et de randonnée.',
      },
    ];
  }

  //supprimer le userId de les match
	async deleteMatch(userId?: number) {
		if (!userId)
		{
			return{
				success: false,
				message: "Un probleme avec la supression du match"
			}
		}
		return{
			success: true,
			message: "Match supprimer"
		}
	}
}
