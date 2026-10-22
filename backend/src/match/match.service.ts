import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ValidateDto } from './dto/validate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MessageGateway } from '../message/message.gateway';
import { Prisma } from '@prisma/client';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService,
              private messageGateway: MessageGateway,
              ){}

  private withPairTransaction<T>(
    firstId: number,
    secondId: number,
    action: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${Math.min(firstId, secondId)}::int, ${Math.max(firstId, secondId)}::int)`;
      return action(tx);
    });
  }

  private notifyActivityChanged(firstId: number, secondId: number) {
    this.messageGateway.server
      .to(`user_${firstId}`).to(`user_${secondId}`)
      .emit('activityChanged', {});
  }

  async rejected(currentUserId: number, validateDto: ValidateDto) {
    if (validateDto.status === 'reject') {
        return { success: true, message: 'Profile Reject !' };
    }
    else if (validateDto.status === 'like') {
      if (currentUserId === validateDto.userId) {
          throw new BadRequestException('Vous ne pouvez pas liker votre propre profil');
      }

      const isMatch = await this.withPairTransaction(currentUserId, validateDto.userId, async (tx) => {
      const targetUser = await tx.user.findUnique({where: {id: validateDto.userId}});
      if (!targetUser) {
          throw new NotFoundException('Utilisateur introuvable');
      }

      const blocked = await tx.block.findFirst({
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

      const existingLike = await tx.like.findUnique({where: {fromUserId_toUserId: {fromUserId: currentUserId, toUserId: validateDto.userId}}});
      if (existingLike) {
          throw new BadRequestException('Vous avez déjà liké ce profil');
      }

          const newLike = await tx.like.create({data: {fromUserId: currentUserId, toUserId: validateDto.userId, createdAt: new Date()}});

      const reverseLike = await tx.like.findUnique({where: { fromUserId_toUserId: { fromUserId: validateDto.userId, toUserId: currentUserId}}});
      const matched = reverseLike !== null;

    if (matched) {
      const matchedAt = new Date(Math.max(Date.now(), newLike.createdAt.getTime(), reverseLike.createdAt.getTime()));
      const user1Id = Math.min(currentUserId, validateDto.userId);
      const user2Id = Math.max(currentUserId, validateDto.userId);

    await tx.match.upsert({
        where: { user1Id_user2Id: { user1Id: user1Id, user2Id: user2Id } },
        update: { isActive: true, seenByUser1: false, seenByUser2: false, createdAt: matchedAt },
        create: { user1Id: user1Id, user2Id: user2Id, createdAt: matchedAt },
    });
  }

    return matched;
  });

    this.notifyActivityChanged(currentUserId, validateDto.userId);
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
      photo: otherUser.photo,
      };
    }));

      matchedProfiles.sort((a, b) => {
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    });

    return matchedProfiles;
  }

  async getActivity(currentUserId: number) {
    return this.prisma.$transaction(async (tx) => {
    const likes = await tx.like.findMany({
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
          eventId: like.id,
          user: like.toUser,
          createdAt: like.createdAt,
        };
      }
    
      return {
        type: 'like_received',
        eventId: like.id,
        user: like.fromUser,
        createdAt: like.createdAt,
      };
    });


    const matches = await tx.match.findMany({
      where: {
        isActive: true,
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
        eventId: match.id,
        user: otherUser,
        createdAt: match.createdAt,
      };
    });

    const activities = [
      ...likeActivities,
      ...matchActivities,
    ];

    activities.sort((a, b) => {
      const dateOrder = b.createdAt.getTime() - a.createdAt.getTime();
      if (dateOrder) return dateOrder;
      const matchOrder = Number(b.type === 'match') - Number(a.type === 'match');
      return matchOrder || b.eventId - a.eventId;
    });

    return activities;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

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

	async deleteMatch(currentUserId: number, otherUserId: number) {
    await this.withPairTransaction(currentUserId, otherUserId, async (tx) => {
    const user1Id = Math.min(currentUserId, otherUserId);
    const user2Id = Math.max(currentUserId, otherUserId);

    const existingMatch = await tx.match.findUnique({
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

    await tx.match.update({
        where: {
            user1Id_user2Id: {
                user1Id: user1Id,
                user2Id: user2Id,
            },
        },
        data: { isActive: false },
    });

    await tx.like.deleteMany({
      where: {
          OR: [
              { fromUserId: currentUserId, toUserId: otherUserId },
              { fromUserId: otherUserId, toUserId: currentUserId },
          ],
      },
    });

    });
    this.notifyActivityChanged(currentUserId, otherUserId);
    return {
        success: true,
        message: "Match supprime"
    }
  }

  async blockUser(currentUserId: number, targetUserId: number) {
    await this.withPairTransaction(currentUserId, targetUserId, async (tx) => {
    const currentId = Math.min(currentUserId, targetUserId);
    const targetId = Math.max(currentUserId, targetUserId);

    if (currentUserId === targetUserId) {
      throw new BadRequestException('Vous ne pouvez pas vous bloquer vous-même.');
    }

    const targetUser = await tx.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
    throw new NotFoundException('Utilisateur introuvable');
    }

    const existingBlock = await tx.block.findUnique({
        where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: targetUserId } },
    });
    if (existingBlock) {
      throw new BadRequestException('Vous avez déjà bloqué cet utilisateur.');
    }

    await tx.block.create({
      data: {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
    });

    const existingMatch = await tx.match.findUnique({
      where: { user1Id_user2Id: { user1Id: currentId, user2Id: targetId } },
    });

    if (existingMatch) {
      await tx.match.update({
        where: { user1Id_user2Id: { user1Id: currentId, user2Id: targetId } },
        data: { isActive: false },
      });
    }

    await tx.like.deleteMany({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: currentUserId },
        ],
      },
    });

    });
    this.notifyActivityChanged(currentUserId, targetUserId);
    return { success: true, message: 'Utilisateur bloqué' };
  }

  async unblockUser(currentUserId: number, targetUserId: number) {
    await this.withPairTransaction(currentUserId, targetUserId, async (tx) => {
    await tx.block.deleteMany({
        where: { blockerId: currentUserId, blockedId: targetUserId },
    });

    });
    this.notifyActivityChanged(currentUserId, targetUserId);
    return { success: true, message: "Utilisateur débloqué" };
  }
}
