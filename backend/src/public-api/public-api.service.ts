import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicUserDto } from './dto/create-public-user.dto';
import { UpdatePublicUserDto } from './dto/update-public-user.dto';

@Injectable()
export class PublicApiService {
  constructor(private prisma: PrismaService) {}

  private publicUserSelect = {
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
    isOnline: true,
    twoFactorEnabled: true,
  } as const;

  async listUsers(limit = 20, offset = 0) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = Math.max(Number(offset) || 0, 0);

    return this.prisma.user.findMany({
      select: this.publicUserSelect,
      orderBy: { id: 'asc' },
      take,
      skip,
    });
  }

  async getUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user;
  }

  async createUser(dto: CreatePublicUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          username: dto.username,
          kind: dto.kind,
          orientation: dto.orientation,
          biography: dto.biography,
        },
        select: this.publicUserSelect,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email ou username déjà utilisé.');
      }
      throw error;
    }
  }

  async updateUser(id: number, dto: UpdatePublicUserDto) {
    await this.getUser(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.username !== undefined && { username: dto.username }),
          ...(dto.kind !== undefined && { kind: dto.kind }),
          ...(dto.orientation !== undefined && { orientation: dto.orientation }),
          ...(dto.biography !== undefined && { biography: dto.biography }),
          ...(dto.photo !== undefined && { photo: dto.photo }),
        },
        select: this.publicUserSelect,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email ou username déjà utilisé.');
      }
      throw error;
    }
  }

  async deleteUser(id: number) {
    await this.getUser(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.friend.deleteMany({
        where: { OR: [{ requesterId: id }, { addresseeId: id }] },
      });
      await tx.message.deleteMany({
        where: { OR: [{ senderId: id }, { receiverId: id }] },
      });
      await tx.like.deleteMany({
        where: { OR: [{ fromUserId: id }, { toUserId: id }] },
      });
      await tx.match.deleteMany({
        where: { OR: [{ user1Id: id }, { user2Id: id }] },
      });
      await tx.block.deleteMany({
        where: { OR: [{ blockerId: id }, { blockedId: id }] },
      });
      await tx.user.delete({ where: { id } });
    });

    return { success: true };
  }
}
