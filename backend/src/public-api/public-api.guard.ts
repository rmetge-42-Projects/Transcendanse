import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface RateBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class PublicApiGuard implements CanActivate {
  private static buckets = new Map<string, RateBucket>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const expectedApiKey = process.env.PUBLIC_API_KEY;

    if (!expectedApiKey) {
      throw new ServiceUnavailableException('Public API key is not configured.');
    }

    const apiKey = this.extractApiKey(request);
    if (apiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid public API key.');
    }

    this.checkRateLimit(request, response, apiKey);
    return true;
  }

  private extractApiKey(request: Request) {
    const headerKey = request.header('x-api-key');
    if (headerKey) {
      return headerKey;
    }

    const authorization = request.header('authorization') ?? '';
    if (authorization.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length);
    }

    return '';
  }

  private checkRateLimit(request: Request, response: Response, apiKey: string) {
    const now = Date.now();
    const windowMs = 60_000;
    const limit = Number(process.env.PUBLIC_API_RATE_LIMIT ?? 60);
    const clientId =
      request.ip ?? request.socket.remoteAddress ?? request.header('user-agent') ?? 'unknown';
    const bucketKey = `${apiKey}:${clientId}`;
    const current = PublicApiGuard.buckets.get(bucketKey);
    const bucket =
      current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    PublicApiGuard.buckets.set(bucketKey, bucket);

    const remaining = Math.max(limit - bucket.count, 0);
    response.setHeader('X-RateLimit-Limit', String(limit));
    response.setHeader('X-RateLimit-Remaining', String(remaining));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > limit) {
      throw new HttpException(
        'Public API rate limit exceeded.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
