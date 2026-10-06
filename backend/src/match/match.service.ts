import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ValidateDto } from './dto/validate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MessageGateway } from '../message/message.gateway';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService,
              private messageGateway: MessageGateway,
              ){}

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

      const blocked = await this.prisma.block.findFirst({
        where: {
            OR: [
                { blockerId: currentUserId, blockedId: validateDto.userId },
                { blockerId: validateDto.userId, blockedId: currentUserId },
            ],
        },
    });
    if (blocked) {
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

    await tx.match.upsert({
        where: { user1Id_user2Id: { user1Id: user1Id, user2Id: user2Id } },
        update: { isActive: true, seenByUser1: false, seenByUser2: false },
        create: { user1Id: user1Id, user2Id: user2Id },
    });
  }

    return matched;
  });

    if (isMatch) {
      this.messageGateway.server.to(`user_${currentUserId}`).emit('newMatch', {});
      this.messageGateway.server.to(`user_${validateDto.userId}`).emit('newMatch', {});
    }

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
            photo: true,
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
            photo:true,
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

    let seenByMe;
    if (match.user1.id === currentUserId) {
      seenByMe = match.seenByUser1;
    } else {
      seenByMe = match.seenByUser2;
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

    let lastActivity = match.createdAt;
    if (lastMessage) {
      lastActivity = lastMessage.createdAt;
    }

    const isBlocked = await this.prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: otherUser.id } },
    });

    return {
      id: otherUser.id,
      username: otherUser.username,
      kind: otherUser.kind,
      orientation: otherUser.orientation,
      biography: otherUser.biography,
      isOnline: onlineStatus,
      isActive: match.isActive,
      isBlocked: isBlocked !== null,
      unreadCount: unreadCount,
      isNewMatch: match.isActive && !seenByMe,
      lastMessage: lastMessage ? lastMessage.content : "",
      lastActivity: lastActivity,
        };
      }));

      matchedProfiles.sort((a, b) => {
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    });

    return matchedProfiles;
  }

  async getActivity(currentUserId: number) {

    const likes = await this.prisma.like.findMany({
      where: {
        OR: [
          { fromUserId: currentUserId },
          { toUserId: currentUserId },
        ],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
          },
        },
        toUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });


    const likeActivities = likes.map((like) => {
      if (like.fromUserId === currentUserId) {
        return {
          type: 'like_sent',
          user: like.toUser,
          createdAt: like.createdAt,
        };
      }
    
      return {
        type: 'like_received',
        user: like.fromUser,
        createdAt: like.createdAt,
      };
    });


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

    const matchActivities = matches.map((match) => {
      let otherUser;
    
      if (match.user1Id === currentUserId)
        otherUser = match.user2;
      else
        otherUser = match.user1;
    
      return {
        type: 'match',
        user: otherUser,
        createdAt: match.createdAt,
      };
    });

    const activities = [
      ...likeActivities,
      ...matchActivities,
    ];

    activities.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return activities;
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

    const blockedByMe = await this.prisma.block.findMany({
      where: { blockerId: currentUserId },
      select: { blockedId: true },
    });
    const blockedByMeIds = blockedByMe.map((block) => block.blockedId);

    const blockedMe = await this.prisma.block.findMany({
      where: { blockedId: currentUserId },
      select: { blockerId: true },
    });
    const blockedMeIds = blockedMe.map((block) => block.blockerId);

    //je regarde si c'est pas moi, je regarde si c'est mon genre , et je regarde si je suis son genre ou si il est all
    //+ si on ne cest pas bloquer
    const compatibleUser = await this.prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
          notIn: [...likedUserIds, ...blockedByMeIds, ...blockedMeIds],
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
        photo: true,
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

    await this.prisma.like.deleteMany({
      where: {
          OR: [
              { fromUserId: currentUserId, toUserId: otherUserId },
              { fromUserId: otherUserId, toUserId: currentUserId },
          ],
      },
    });

    return {
        success: true,
        message: "Match supprime"
    }
  }

  async blockUser(currentUserId: number, targetUserId: number) {
    const currentId = Math.min(currentUserId, targetUserId);
    const targetId = Math.max(currentUserId, targetUserId);

    if (currentUserId === targetUserId) {
      throw new BadRequestException('Vous ne pouvez pas vous bloquer vous-même.');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
    throw new NotFoundException('Utilisateur introuvable');
    }

    const existingBlock = await this.prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: targetUserId } },
    });
    if (existingBlock) {
      throw new BadRequestException('Vous avez déjà bloqué cet utilisateur.');
    }

    await this.prisma.block.create({
      data: {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
    });

    const existingMatch = await this.prisma.match.findUnique({
      where: { user1Id_user2Id: { user1Id: currentId, user2Id: targetId } },
    });

    if (existingMatch) {
      await this.prisma.match.update({
        where: { user1Id_user2Id: { user1Id: currentId, user2Id: targetId } },
        data: { isActive: false },
      });
    }

    await this.prisma.like.deleteMany({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: currentUserId },
        ],
      },
    });
  }

  async unblockUser(currentUserId: number, targetUserId: number) {
    await this.prisma.block.deleteMany({
        where: { blockerId: currentUserId, blockedId: targetUserId },
    });
    return { success: true, message: "Utilisateur débloqué" };
  }
}
