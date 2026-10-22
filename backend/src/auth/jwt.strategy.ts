import { PrismaService } from '../prisma/prisma.service';
//regle de verification du jwt
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { id: number; email: string; version?: number; purpose?: string }) {
    if (payload.purpose || !Number.isInteger(payload.id)) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, sessionVersion: true } });
    if (!user || (payload.version ?? 0) !== user.sessionVersion) throw new UnauthorizedException();
    return { id: user.id, email: user.email };
  }
}