*This project has been created as part of the 42 curriculum by rmetge, bemma, cipelat, desambou.*

# Transendanse

Transendanse is a full-stack social matching application. Users can register, create a profile, discover compatible profiles, match with other users, exchange real-time messages, manage contacts through matches and secure their account with two-factor authentication.

## Instructions

```bash
cp .env.example .env
make
```

The application is then available at:

```text
https://localhost:8443
```

For daily use:

```bash
make down
make re
docker compose logs -f
```

Set real `PUBLIC_API_KEY` and `BACKUP_ENCRYPTION_KEY` values in `.env` before evaluation. The fallback API key is only for local development.

## Technical Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt, optional TOTP 2FA |
| Real-time | Socket.IO WebSockets |
| Reverse proxy | Nginx over HTTPS |
| Secrets | HashiCorp Vault |
| Monitoring | Prometheus, Grafana, Alertmanager and status page |
| Backups | Encrypted PostgreSQL backups |

## Database Schema

Main entities:

- `User`: account, profile, avatar, online status and 2FA fields.
- `Like`: one-way profile likes.
- `Match`: active or inactive two-user matches.
- `Message`: direct messages between matched users.
- `Block`: blocked-user relationships.

The Prisma schema is in `backend/prisma/schema.prisma`.

## Features

- Email/password registration and login with hashed passwords.
- Profile creation and update.
- Avatar upload/crop with backend validation for accepted image formats and size.
- Match deck with stable session state and temporary rejected-profile delay.
- Real-time messaging between matched users only.
- Message read state, unread counts, conversation deletion and message hiding.
- Match-based contacts: add by mutual like, remove by deleting a match, list in messages, view profile information and online status.
- Blocking and unblocking.
- 2FA generation, confirmation, login verification and disable flow.
- Public API under `/api/public` with API key protection and rate limiting.
- Privacy Policy and Terms of Service pages.

## Modules And Point Calculation

The target score excludes DevOps modules.

| Module | Type | Points | Implementation |
| --- | --- | ---: | --- |
| Use a framework for both frontend and backend | Major | 2 | Next.js frontend and NestJS backend |
| Real-time features with WebSockets | Major | 2 | Socket.IO connection lifecycle, online status, message/match events |
| User interaction | Major | 2 | Chat, matched profile view, match-based contacts as friends: mutual like to add, delete match to remove, list in messages |
| Public API for database interaction | Major | 2 | `/api/public/docs`, `/api/public/users`, `/api/public/users/:id` with GET, POST, PUT, DELETE, API key and rate limit |
| Standard user management and authentication | Major | 2 | Profile update, avatar, match contacts, online status, profile pages, JWT auth |
| ORM for database | Minor | 1 | Prisma |
| Custom-made design system | Minor | 1 | Reusable UI primitives in `front/src/composant/ui` |
| Additional browsers | Minor | 1 | Firefox, Safari and Edge support documented in `docs/browser-support.md` |
| 2FA | Minor | 1 | TOTP secret, QR code, confirmation, login verification, disable |

Total target score without DevOps modules: **14 points**.

## Public API

Documentation is available in `docs/public-api.md` and at runtime through:

```bash
curl -k https://localhost:8443/api/public/docs \
  -H "x-api-key: dev-public-api-key-change-me"
```

## Browser Support

The application targets Chrome plus Firefox, Safari and Edge. The manual verification matrix is documented in `docs/browser-support.md`.

## Team Information And Contributions

| Contributor | Main areas |
| --- | --- |
| rmetge | Initial database/application structure and project coordination |
| bemma | Match module, backend/frontend matching flow, messaging integration and session fixes |
| cipelat | Frontend/account/profile work and user-facing flows |
| desambou | Infrastructure, deployment scripts and documentation support |

Recent hardening work added the public API, legal pages, browser-support documentation, design-system components and module documentation on the `Emma` branch.

## Project Management

The project is organized around feature branches and a final integration branch. The final branch should keep generated dependencies out of Git, keep `.env` ignored, and include `.env.example` for local setup.

## Resources And AI Usage

Documentation consulted during development includes the official documentation for Next.js, NestJS, Prisma, Socket.IO, Docker, Vault and 42 subject requirements.

AI assistance was used for audit, debugging, documentation drafting and implementation support. Human team members remain responsible for reviewing, testing and defending the final implementation.
