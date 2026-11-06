import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

@WebSocketGateway({cors: { origin: corsOrigin }})
export class MessageGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: { sessionVersion: true },
      });
      if (!user || (payload.version ?? 0) !== user.sessionVersion) {
        client.disconnect();
        return;
      }
      await client.join(`user_${payload.id}`);
      // Recheck after joining: a password change may have raced with the handshake.
      const current = await this.prisma.user.findUnique({ where: { id: payload.id }, select: { sessionVersion: true } });
      if (!current || (payload.version ?? 0) !== current.sessionVersion) {
        client.disconnect();
        return;
      }
      client.data.userId = payload.id;

      await this.prisma.user.update({
        where: { id: payload.id },
        data: { isOnline: true },
      });

      await client.join('authenticated');
      console.log('Utilisateur connecté :', payload.id);
    }
    catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const remaining = await this.server.in(`user_${userId}`).fetchSockets();
      if (remaining.length > 0) return;

      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false },
      });
      console.log('Utilisateur déconnecté :', userId);
    } catch (error) {
      console.log('Utilisateur introuvable, statut non mis à jour');
    }
  }

  sendNewMessage(userId: number, message: any) {
    this.server.to(`user_${userId}`).emit('newMessage', message);
  }

  notifySuggestionsChanged() {
    this.server.to('authenticated').emit('suggestionsChanged');
  }

}
