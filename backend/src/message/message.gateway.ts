import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';


@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN ?? 'https://transcendance42.fr:8443' } })

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
      client.join(`user_${payload.id}`);
      client.data.userId = payload.id;

      await this.prisma.user.update({
        where: { id: payload.id },
        data: { isOnline: true },
      });

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
      // Ne passer hors ligne que s'il ne reste plus aucun socket pour cet utilisateur (en excluant le socket qui se deconnecte)
      const sockets = await this.server.in(`user_${userId}`).fetchSockets();
      const remaining = sockets.filter((s) => s.id !== client.id);
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

}
