import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ValidateDto } from './dto/validate.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  //valide ou non le profile de mach et dire si on a un match
  async rejected(currentUserId: number, validateDto: ValidateDto) {
    if (validateDto.status === 'reject') {
        return { success: true, message: 'Profile Reject !' };
    }
    else if (validateDto.status === 'like') {
      if (currentUserId === validateDto.userId) {
          throw new BadRequestException('Vous ne pouvez pas liker votre propre profil');
      }

      const targetUser = await this.prisma.user.findUnique({where: {id: validateDto.userId}});
      if (!targetUser) {
          throw new NotFoundException('Utilisateur introuvable');
      }

      const existingLike = await this.prisma.like.findUnique({where: {fromUserId_toUserId: {fromUserId: currentUserId, toUserId: validateDto.userId}}});
      if (existingLike) {
          throw new BadRequestException('Vous avez déjà liké ce profil');
      }

      const isMatch = await this.prisma.$transaction(async (tx) => {
          await tx.like.create({data: {fromUserId: currentUserId, toUserId: validateDto.userId}});

          const reverseLike = await tx.like.findUnique({where: { fromUserId_toUserId: { fromUserId: validateDto.userId, toUserId: currentUserId}}});
          const matched = reverseLike !== null;

          if (matched) {
              const user1Id = Math.min(currentUserId, validateDto.userId);
              const user2Id = Math.max(currentUserId, validateDto.userId);
              try {
                await tx.match.create({data: {user1Id: user1Id, user2Id: user2Id}});
              } catch (error) {
              // Le match existe déjà dans ce cas la , mais ce nest pas une erreur
            }
          }

          return matched;
      });

      return { success: true, message: isMatch ? 'C\'est un Match !' : 'Profile Like !', match: isMatch };
      }
    else {
      return { success: false, message: 'probleme' };
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
            isOnline: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            kind: true,
            orientation: true,
            biography: true,
            isOnline: true,
          },
        },
      },
    });

    const matchedProfiles = await Promise.all(matches.map(async (match) => {
    let otherUser;
    if (match.user1.id === currentUserId) {
      otherUser = match.user2;
    } else {
      otherUser = match.user1;
    }
    
    let onlineStatus;
    if (match.isActive) {
      onlineStatus = otherUser.isOnline;
    }
    else {
      onlineStatus = false;
    }

    const unreadCount = await this.prisma.message.count({
      where: {
          senderId: otherUser.id,
          receiverId: currentUserId,
          isRead: false,
          deletedForReceiver: false,
        },
    });

    const lastMessage = await this.prisma.message.findFirst({
      where: {
        OR: [
            { senderId: currentUserId, receiverId: otherUser.id, deletedForSender: false },
            { senderId: otherUser.id, receiverId: currentUserId, deletedForReceiver: false },
          ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: otherUser.id,
      username: otherUser.username,
      kind: otherUser.kind,
      orientation: otherUser.orientation,
      biography: otherUser.biography,
      isOnline: onlineStatus,
      isActive: match.isActive,
      lastMessage: lastMessage ? lastMessage.content : "",
        };
      }));
    return matchedProfiles;
  }

  //envoie les infos des profil des match
  //faire une pres selection (orientation sexuel ...)
  //pour faire les carte de match
  async getOtherProfile(currentUserId: number) {

    const currentUser = await this.prisma.user.findUnique({where: { id: currentUserId }});

    if (!currentUser) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (!currentUser.kind || !currentUser.orientation) {
      throw new BadRequestException('Profil incomplet');
    }

    let kindFilter;
    if (currentUser.orientation == 'all') {
      kindFilter = {not: null};
    }
    else  {
      kindFilter = currentUser.orientation;
    }

    const sentLikes = await this.prisma.like.findMany({where: {fromUserId: currentUserId}, select: {toUserId: true}});
    const likedUserIds = sentLikes.map((like) => like.toUserId);

    //je regarde si c'est pas moi, je regarde si c'est mon genre , et je regarde si je suis son genre ou si il est all
    const compatibleUser = await this.prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
          notIn: likedUserIds,
        },
        kind: kindFilter,
        OR: [
          {
            orientation: currentUser.kind,
          },
          {
            orientation: 'all',
          },
        ],
      },
      select: {
        id: true,
        username: true,
        kind: true,
        orientation: true,
        biography: true,
      },
    });
    return compatibleUser;
  }

  //supprimer un match
	async deleteMatch(currentUserId: number, otherUserId: number) {
    const user1Id = Math.min(currentUserId, otherUserId);
    const user2Id = Math.max(currentUserId, otherUserId);

    const existingMatch = await this.prisma.match.findUnique({
        where: {
            user1Id_user2Id: {
                user1Id: user1Id,
                user2Id: user2Id,
            },
        },
    });

    if (!existingMatch) {
        throw new NotFoundException('Match introuvable');
    }

    await this.prisma.match.update({
        where: {
            user1Id_user2Id: {
                user1Id: user1Id,
                user2Id: user2Id,
            },
        },
        data: { isActive: false },
    });

    return {
        success: true,
        message: "Match supprime"
    }
  }
}
