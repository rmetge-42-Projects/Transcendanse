# Sécurisation des routes (JWT Guard)

Stack : **@nestjs/passport** + **passport-jwt** — vérifient qu'un token JWT valide est présent avant d'autoriser l'accès à une route.

## Installation

Depuis `backend/` :

```bash
npm install @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

Le `.env` doit déjà contenir `JWT_SECRET` (utilisé à la fois pour fabriquer les tokens dans `auth.module.ts` et pour les vérifier ici) :
```
JWT_SECRET=un_secret_a_toi
```

## Les 2 fichiers à créer

### `src/auth/jwt.strategy.ts` — définit COMMENT vérifier un token

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { id: number; email: string }) {
    return { id: payload.id, email: payload.email };
  }
}
```

- `jwtFromRequest` → va chercher le token dans le header `Authorization: Bearer xxxxx`
- `ignoreExpiration: false` → un token expiré (> 1 jour) est rejeté
- `secretOrKey` → la clé utilisée pour vérifier que le token est authentique (même clé que celle qui l'a signé)
- `validate(payload)` → s'exécute une fois le token vérifié avec succès ; ce qu'elle renvoie devient accessible via `req.user` dans le controller

### `src/auth/jwt-auth.guard.ts` — le "videur" qui applique cette vérification

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Hérite de tout le comportement de `AuthGuard`, réglé pour utiliser la stratégie `'jwt'` (= notre `JwtStrategy`, reconnue automatiquement sous ce nom par la librairie `passport-jwt`).

**Différence entre les deux fichiers** : la Strategy définit *comment* vérifier (le règlement), le Guard est ce qui *applique* concrètement cette vérification sur une route précise.

## Brancher la stratégie dans `auth.module.ts`

Ajouter l'import et l'enregistrer dans `providers` :

```typescript
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [ /* ... existant ... */ ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]   // ← JwtStrategy ajouté ici
})
export class AuthModule {}
```

Sans cette ligne, NestJS ne saurait pas fournir cette stratégie au Guard.

## Protéger une route avec le Guard

Dans un controller, ajouter `@UseGuards(JwtAuthGuard)` juste au-dessus de la route à protéger :

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Post('password')
async modifyPassword(@Body() passwordDto: PasswordDto) {
  return this.authService.password(passwordDto);
}
```

**Effet concret** : si la requête n'a pas de token, ou un token invalide/expiré, la route renvoie automatiquement une erreur `401 Unauthorized`, **sans jamais exécuter** le code de la fonction — le Guard bloque avant même d'entrer dans le controller.

## Comment récupérer l'utilisateur connecté dans une route protégée

Une fois une route protégée par `@UseGuards(JwtAuthGuard)`, l'identité de la personne connectée (ce que `validate()` a renvoyé dans la Strategy) est accessible via `@Req()` :

```typescript
import { Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Req() req: Request) {
  const userId = (req.user as { id: number }).id;
  return this.usersService.getProfile(userId);
}
```

C'est ce qui permettra, dans `users`, de savoir *qui* demande son profil, plutôt que de renvoyer toujours la même donnée codée en dur.

## Tester qu'une route est bien protégée

```bash
# Sans token → doit renvoyer une erreur 401
curl -X POST http://localhost:4000/auth/password \
  -H "Content-Type: application/json" \
  -d '{"newPass":"abc","verifNewPass":"abc","lastPass":"xyz"}'

# Avec un token valide → doit fonctionner normalement
curl -X POST http://localhost:4000/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LE_TOKEN_RECU_AU_LOGIN" \
  -d '{"newPass":"abc","verifNewPass":"abc","lastPass":"xyz"}'
```

## Fichiers importants

- `src/auth/jwt.strategy.ts` → définit comment vérifier un token (partagé sur Git)
- `src/auth/jwt-auth.guard.ts` → le Guard réutilisable sur n'importe quelle route (partagé sur Git)
- `JWT_SECRET` dans `.env` → **jamais partagé sur Git**, indispensable pour signer et vérifier les tokens
