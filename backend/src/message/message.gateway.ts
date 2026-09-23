import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({cors: { origin: '*'}})
export class MessageGateway {
  constructor(private readonly jwtService: JwtService) {}

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
    
      console.log('Utilisateur connecté :', payload.id);
    } 
    catch {
      client.disconnect();
    }
  }

  sendNewMessage(userId: number, message: any) {
    this.server.to(`user_${userId}`).emit('newMessage', message);
  }

}