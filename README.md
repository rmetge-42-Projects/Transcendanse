*This project has been created as part of the 42 curriculum by rmetge, bemma, cipelat, desambou.*

# Transendanse

## Description

Transendanse is a full-stack dating and social matching application. It lets users create profiles, discover people, like profiles, form matches, and chat in real time. The project combines user-facing features with a secured and monitored deployment stack.

Key features include:

- Account registration and login with password hashing, JWT sessions, and optional TOTP two-factor authentication.
- Profile creation and editing, avatar upload and cropping, and online presence.
- Profile discovery, likes, mutual matches, match-based contacts, blocking, and notifications.
- Real-time conversations, read state, unread counts, and message or conversation hiding/deletion.
- A protected public user API, served through HTTPS with Nginx and ModSecurity.
- Vault-managed runtime secrets, PostgreSQL persistence, encrypted database backups, service health checks, and Prometheus/Grafana monitoring.

## Instructions

### Prerequisites

- Docker Engine with the Docker Compose v2 plugin (`docker compose` command).
- GNU Make and a shell able to run the repository scripts.
- Git to clone the repository.
- A browser to use the application. Local TLS certificates are self-signed, so the browser will ask you to trust the local certificate.
- Sufficient available RAM and disk space for Docker images, containers, and database volumes. The Makefile builds the backend and frontend one after the other to limit build-time memory use.

The containers provide the application runtimes: Node.js, Next.js, NestJS, PostgreSQL, Nginx, Vault, and monitoring services. Installing Node.js or PostgreSQL on the host is not required for the Docker workflow.

### Configuration and startup

1. Clone the repository and enter its root directory.
2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env`. Replace the example database username, password, and database name with local values. Set `BACKUP_ENCRYPTION_KEY` to a randomly generated 64-character hexadecimal key. `GMAIL_APP_PASSWORD` is only needed if using the email-dependent functionality. Keep `.env` private and never commit it.
4. Build and start the stack:

   ```bash
   make
   ```

   The Makefile prepares local TLS certificates and the backups directory, builds `backend`, then `frontend`, and finally runs `docker compose up -d`. Docker Compose starts the supporting services and any remaining service images needed by the stack.
5. Check container health and follow startup logs if needed:

   ```bash
   docker compose ps
   docker compose logs -f
   ```

6. Open <https://localhost:8443> and accept the warning for the self-signed local certificate.

Useful commands:

```bash
make down       # Stop containers; keep volumes
make clean      # Stop containers and remove local project images
make re         # Remove volumes/images, then rebuild and start from scratch
docker compose logs -f backend
```

`make re` removes volumes, including persisted application data and Vault state. Use it only when a full reset is intended. The local API key is initialized and stored by Vault; it is not configured in the frontend or `.env`. See [docs/public-api.md](docs/public-api.md) for authorized local API access instructions.

Additional service endpoints are configured in [docker-compose.yml](docker-compose.yml). The project includes a manual validation guide at [TESTS_VALIDATION_MODULES.md](TESTS_VALIDATION_MODULES.md), browser checks at [docs/browser-support.md](docs/browser-support.md), and public API documentation at [docs/public-api.md](docs/public-api.md).

## Technical Stack

### Frontend

- **Next.js 16, React 19, TypeScript, Tailwind CSS 4:** component-based interface with server-rendered pages and typed client code.

### Backend

- **NestJS 11, TypeScript:** modular HTTP API.
- **Socket.IO:** real-time messaging and online presence.
- The frontend and backend run as separate services, keeping their frameworks, runtime configuration, and build processes independent.

### Database

- **PostgreSQL 15:** chosen for relational user and social data, including likes, matches, messages, blocks, contacts, and notifications.
- **Prisma 6:** provides typed database access and schema/migration tooling.

### Other significant technologies

- **Authentication:** JWT, bcrypt, and TOTP (`otplib`) for authenticated API access, password hashing, and optional second-factor login.
- **Edge and secrets:** Nginx, ModSecurity/OWASP CRS, and HashiCorp Vault provide the TLS reverse proxy, request filtering, and centralized runtime secrets.
- **Operations:** Docker Compose, Prometheus, Grafana, and Alertmanager provide the multi-service environment, metrics, dashboards, and alert rules.
- **Status and backups:** an Express status page, PostgreSQL tools, and encrypted backup scripts support service status reporting and database backups.

## Database Schema

The canonical schema is [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma). All primary keys are auto-incrementing integer IDs unless noted otherwise. Prisma `DateTime` fields are stored as timestamps; `String` fields hold text values; `Boolean` fields represent flags.

| Model | Main fields | Relationships and purpose |
| --- | --- | --- |
| `User` | `id`, unique `email`, optional unique `username`, `password`, profile fields, `twoFactorSecret`, `twoFactorEnabled`, `isOnline` | Central account. Related to all social and messaging records. |
| `Like` | `id`, `fromUserId`, `toUserId`, `createdAt` | Two foreign keys to `User`; unique sender/recipient pair. A reciprocal pair can lead to a match. |
| `Match` | `id`, `user1Id`, `user2Id`, `createdAt`, `isActive`, seen flags | Two foreign keys to `User`; records a match/contact relationship. |
| `Message` | `id`, `senderId`, `receiverId`, `content`, optional `photo`, `createdAt`, `isRead`, deletion flags | Sender and receiver are both users; supports direct conversations and per-side hiding. |
| `Block` | `id`, `blockerId`, `blockedId`, `createdAt` | Two user relationships; unique blocker/blocked pair. |
| `Friend` | `id`, `requesterId`, `addresseeId`, `status`, timestamps | Two user relationships; unique requester/addressee pair. The current contact flow primarily uses matches. |
| `Notification` | `id`, `userId`, `type`, `action`, `title`, optional message/entity/read time, `createdAt` | Belongs to one user; indexed by user, read state, and creation time. |

In summary: `User` has one-to-many relationships with sent/received likes, matches on either side, messages on either side, blocks on either side, friend requests, and notifications. Foreign keys connect these records to their users; several pair relationships have composite uniqueness constraints to prevent duplicates.

## Features List

| Feature | What it does | Contributors visible in repository history* |
| --- | --- | --- |
| Registration, login, password handling, and 2FA | Creates accounts, authenticates users, hashes passwords, and supports TOTP setup and verification. | Emma (`bemma`), Romane (`rmetge`), Cindy (`cipelat`), Delphine (`desambou`) |
| User profiles and avatars | Creates and edits profile information and supports profile photos/cropping. | Romane (`rmetge`), Cindy (`cipelat`), Emma (`bemma`) |
| Discovery, likes, and matches | Presents profiles, records likes, and forms/removes mutual matches. | Emma (`bemma`), Romane (`rmetge`), Cindy (`cipelat`) |
| Messaging and presence | Sends direct messages in real time and tracks online state, read state, and conversation controls. | Romane (`rmetge`), Cindy (`cipelat`), Emma (`bemma`) |
| Public user API | Provides documented, API-key-protected user CRUD endpoints with rate limiting. | Delphine (`desambou`), Emma (`bemma`) |
| Infrastructure, security, and monitoring | Runs the app with Compose, Nginx/ModSecurity, Vault, monitoring, status checks, and database backup services. | Delphine (`desambou`), with team integration commits |
| Legal and privacy pages | Provides privacy and terms pages. | Emma (`bemma`), Romane (`rmetge`) |


## Modules and Point Calculation

The team currently expects **19 points** from the module mapping below. 

| Module | Type | Points | Implementation in this project |
| --- | --- | ---: | --- |
| Frameworks for frontend and backend | Major | 2 | Next.js/React frontend and NestJS backend. |
| Real-time features with WebSockets | Major | 2 | Socket.IO messaging and online presence. |
| User interaction | Major | 2 | Profile discovery, likes, matches/contacts, and direct chat. |
| Public API for database interaction | Major | 2 | API-key-protected documented user endpoints with CRUD operations. |
| Standard user management and authentication | Major | 2 | Registration/login, JWT, profile management, and account state. |
| ORM for database | Minor | 1 | Prisma models and generated client over PostgreSQL. |
| Custom-made design system | Minor | 1 | Reusable UI components in `front/src/composant/ui`. |
| Additional browsers | Minor | 1 | Browser support target and manual test checklist in `docs/browser-support.md`. |
| Two-factor authentication | Minor | 1 | TOTP setup, confirmation, login verification, and disable flow. |
| WAF / ModSecurity | Major | 2 | Nginx with ModSecurity and the OWASP Core Rule Set; Vault is also used to manage runtime secrets. |
| Monitoring with Prometheus and Grafana | Major | 2 | Metrics, dashboard provisioning, and Prometheus alert rules. |
| Health checks, status page, backups, and recovery procedure | Minor | 1 | Compose health checks, status page, encrypted PostgreSQL backups, and recovery documentation. |
| **Expected total** |  | **19** | **14 application points + 5 infrastructure/security points.** |

The validation guide notes that some subject modules require strict demonstrations (for example, browser testing and WAF behavior). 

## Team Information

Each team member listed at the top of this README has an assigned role and a brief description of their responsibilities.

| Login | Role(s) | Responsibilities |
| --- | --- | --- |
| `rmetge` | Product Owner (PO), Project Manager (PM), Developer | Guides product direction and project follow-up, organizes and attends team meetings, coordinates module testing, and contributes to account/profile, matching, and messaging features. |
| `bemma` | Project Manager (PM), Developer | Supports project coordination and contributes to matching, messaging, real-time session behavior, and authentication. |
| `cipelat` | Developer | Contributes to profile and messaging flows, blocked-user handling, and socket behavior. |
| `desambou` | Technical Lead, Developer | Leads application architecture and coordination across components, ensures the application runs as an integrated whole, and contributes to the public API and deployment/security infrastructure. |

## Project Management

### Work organization

- Work was divided across application features and infrastructure modules. The Git history shows development on feature branches followed by integration through merge commits.
- `desambou`, as Technical Lead, coordinated the architecture and integration across components. `rmetge` followed up on team meetings and coordinated module testing; `bemma` also contributed to project coordination.
- The team held a weekly meeting, either in person or partly by video call when a member could not attend in person.

### Project management tools

- Git and the GitHub repository were used for version control and collaboration.
- The team used feature branches and merge commits to organize and integrate code changes. No separate task-tracking tool is listed.

### Communication

- Discord was the central communication channel for reporting code problems and receiving notifications about code changes.
- `rmetge` organized and attended the weekly team meetings.

## Individual Contributions

The feature examples summarize work visible in the repository history and may not capture pair work, reviews, or work committed under another account. Team roles and project responsibilities are described separately above.

- **`rmetge` (Romane):** account creation and profile data, profile photos, match and messaging interface changes, and application integration.
- **`bemma` (Emma):** match display and deck behavior, real-time/session fixes, account and 2FA updates, and legal pages.
- **`cipelat` (Cindy):** profile and password-related updates, blocked-user controls, messaging improvements, and WebSocket connection/disconnection behavior.
- **`desambou` (Delphine):** public API and API documentation, Vault-based secret handling, deployment/security/monitoring work, and README/build-memory changes.

Challenges evidenced in project changes include coordinating feature branches and resolving integration conflicts, stabilizing real-time connection state, and reducing memory pressure during Docker builds by building the backend and frontend sequentially and excluding `node_modules` from their build contexts.

## Resources and AI Usage

### Technical references

- The 42 ft_transcendence subject and README requirements provided for this project.
- [Next.js documentation](https://nextjs.org/docs)
- [React documentation](https://react.dev/learn)
- [NestJS documentation](https://docs.nestjs.com/)
- [Prisma documentation](https://www.prisma.io/docs)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Socket.IO documentation](https://socket.io/docs/v4/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [HashiCorp Vault documentation](https://developer.hashicorp.com/vault/docs)
- [Stéphane Robert's DevSecOps learning resources](https://www.stephane-robert.info/docs/devops/)
- [Prometheus documentation](https://prometheus.io/docs/)
- [Grafana documentation](https://grafana.com/docs/)
- [OWASP ModSecurity Core Rule Set](https://coreruleset.org/)

### AI usage

AI tools were used for debugging, coding assistance, and writing project documentation, including this README. They also helped the team understand ft_transcendence modules and learn about Docker, HashiCorp Vault, and DevSecOps, including material from Stephan Robet's DevSecOps site. For example, AI assistance contributed to discussing the sequential backend/frontend build workflow and `.dockerignore` exclusions documented in this repository. Team members reviewed the suggestions and remain responsible for validating, understanding, and defending the final implementation.

## Known Limitations

- The application's user experience and accessibility are limited and have not been brought into conformity with applicable French and European accessibility standards.
- HTTPS uses a locally generated self-signed certificate in the development setup.
- The application is a demonstration and is intended for a limited number of users.
- Match records are used as the application's friends/contacts list.




   id |      email      | name  |   username   |    kind    | orientation 
----+-----------------+-------+--------------+------------+-------------
  1 | maya@gmail.com  | Maya  | maya_dance   | woman      | all
  2 | noah@gmail.com  | Noah  | noah_moves   | man        | woman
  3 | leila@gmail.com | Leila | leila_swing  | woman      | all
  4 | sami@gmail.com  | Sami  | sami_flow    | non_binary | all
  5 | clara@gmail.com | Clara | clara_steps  | woman      | man
  6 | kenji@gmail.com | Kenji | kenji_beat   | man        | all
  7 | iris@gmail.com  | Iris  | iris_salsa   | non_binary | all
  8 | leo@gmail.com   | Leo   | leo_tango    | man        | woman
  9 | lina@gmail.com  | Lina  | lina_groove  | woman      | all
 10 | adam@gmail.com  | Adam  | adam_rock    | man        | all
 11 | naima@gmail.com | Naima | naima_latina | woman      | man
 12 | robin@gmail.com | Robin | robin_wave   | non_binary | all
 13 | hana@gmail.com  | Hana  | hana_kpop    | woman      | all
 14 | malik@gmail.com | Malik | malik_pop    | man        | woman
 15 | zoe@gmail.com   | Zoe   | zoe_vibes    | woman      | all
