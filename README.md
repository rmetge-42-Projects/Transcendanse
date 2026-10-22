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

Additional service endpoints are configured in [docker-compose.yml](docker-compose.yml). Browser checks are documented in [docs/browser-support.md](docs/browser-support.md), public API usage in [docs/public-api.md](docs/public-api.md), and PostgreSQL restoration in the [Database Backup and Recovery section](#database-backup-and-recovery).

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
| Custom-made design system | Minor | 1 | Interface components and pages in `front/src/app` and `front/src/composant`, shared layout components in `front/src/display`, and reusable loading/error states in `front/src/constant` |
| Additional browsers | Minor | 1 | Browser support target and manual test checklist in `docs/browser-support.md`. |
| Two-factor authentication | Minor | 1 | TOTP setup, confirmation, login verification, and disable flow. |
| WAF / ModSecurity | Major | 2 | Nginx with ModSecurity and the OWASP Core Rule Set; Vault is also used to manage runtime secrets. |
| Monitoring with Prometheus and Grafana | Major | 2 | Metrics, dashboard provisioning, and Prometheus alert rules. |
| Health checks, status page, backups, and recovery procedure | Minor | 1 | Compose health checks, status page, encrypted PostgreSQL backups, and the [PostgreSQL restoration procedure](#database-backup-and-recovery). |
| **Expected total** |  | **19** | **14 application points + 5 infrastructure/security points.** |

The validation guide notes that some subject modules require strict demonstrations (for example, browser testing and WAF behavior). 

## Team Information

Each team member listed at the top of this README has an assigned role and a brief description of their responsibilities.

| Login | Role(s) | Responsibilities |
| --- | --- | --- |
| `rmetge` | Product Owner (PO), Project Manager (PM), Developer | Guides product direction and project follow-up, organizes and attends team meetings, coordinates module testing, and contributes to account/profile, matching, and messaging features. |
| `bemma` | Project Manager (PM), Developer | Supports project coordination and contributes to matching, messaging, real-time session behavior, and authentication. |
| `cipelat` | Product Owner (PO), Developer | Contributes to profile and messaging flows, blocked-user handling, and socket behavior. |
| `desambou` | Technical Lead, Developer | Leads application architecture and coordination across components, ensures the application runs as an integrated whole, and contributes to the public API and deployment/security infrastructure. |

## Project Management

### Work organization

- Work was divided across application features and infrastructure modules. The Git history shows development on feature branches followed by integration through merge commits.
- `desambou`, as Technical Lead, coordinated the architecture and integration across components. `rmetge` followed up on team meetings and coordinated module testing; `bemma` also contributed to project coordination. `cipelat` contributed to profile and messaging features, blocked-user handling, and socket behavior.
- The team held a weekly meeting, either in person or partly by video call when a member could not attend in person.

### Project management tools

- Canva was used to organize and plan the project before coding began.
- Git and the GitHub repository were used for version control and collaboration, with feature branches and merge commits to organize and integrate code changes.

### Communication

- Discord was the central communication channel for reporting code problems and receiving notifications about code changes.
- `rmetge` organized and attended the weekly team meetings.

## Individual Contributions

The feature examples summarize work visible in the repository history and may not capture pair work, reviews, or work committed under another account. Team roles and project responsibilities are described separately above.

- **`rmetge` (Romane):** account creation and profile data, profile photos, match and messaging interface changes, and application integration.
- **`bemma` (Emma):** match display and deck behavior, real-time/session fixes, account, and legal pages.
- **`cipelat` (Cindy):** profile and password-related updates, blocked-user controls, messaging improvements, and WebSocket connection/disconnection behavior and 2FA updates.
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

AI tools were used for debugging, coding assistance, and writing project documentation, including this README. They also helped the team understand ft_transcendence modules and learn. For example, AI assistance contributed to discussing the sequential backend/frontend build workflow and `.dockerignore` exclusions documented in this repository. Team members reviewed the suggestions and remain responsible for validating, understanding, and defending the final implementation.

## Database Backup and Recovery

This procedure restores **the PostgreSQL database only** after its volume has been deleted or lost. It does not provide full platform recovery.

### Backup coverage

- `backup_monitor` creates an encrypted PostgreSQL dump in `backups/` approximately every ten minutes.
- The `backups/` directory is a host bind mount and is ignored by Git. It is not removed by `docker compose down -v` or `make fclean`.
- The service retains the six most recent files, providing approximately one hour of retention under normal operation.
- The dump does not include uploads in the `vol_back` volume, Vault storage, Grafana internal data, Prometheus history, or Alertmanager state and silences.

**Before deleting any volumes**, copy important dumps off this machine. `make fclean` and `make re` delete the project's Compose volumes, including the database, Vault, uploads, Grafana, and Prometheus metrics. Files in `backups/` remain on the local disk, but do not protect against loss of that disk.

### Prerequisites

1. Run the commands from the Chi-Fou-Mi project root.
2. Have a valid, uncommitted `.env` file with `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and the same `BACKUP_ENCRYPTION_KEY` that was used to encrypt the dump.
3. To restore Gmail delivery after recreating Vault, also configure `GMAIL_APP_PASSWORD` in `.env`. Never paste these values into a ticket, chat, or audit report.
4. Have at least one non-empty `backups/backup_*.sql.enc` file.

The dump cannot be restored without the original encryption key. Do not replace that key with a new value before decryption.

### Restore PostgreSQL to a new volume

This procedure is for a new PostgreSQL volume, for example after `make fclean`. **Do not run it against an existing database containing data you need to keep**: it may fail on existing objects or result in a partial restore.

The script selects the most recent dump, reads the key locally without displaying it, decrypts to a private temporary file, and imports the SQL before starting the rest of the stack.

```sh
set -eu
set +x

if [ ! -r .env ]; then
  echo "Error: .env is missing or unreadable." >&2
  exit 1
fi

BACKUP_FILE="$(ls -1t backups/backup_*.sql.enc 2>/dev/null | head -n 1)"
if [ -z "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
  echo "Error: no non-empty encrypted dump found in backups/." >&2
  exit 1
fi

BACKUP_ENCRYPTION_KEY="$(sed -n 's/^BACKUP_ENCRYPTION_KEY=//p' .env | tail -n 1)"
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
  echo "Error: BACKUP_ENCRYPTION_KEY is missing from .env." >&2
  exit 1
fi
export BACKUP_ENCRYPTION_KEY

umask 077
RESTORE_FILE="$(mktemp "${TMPDIR:-/tmp}/chi-fou-mi-restore.XXXXXX")"
cleanup() {
  rm -f "$RESTORE_FILE"
  unset BACKUP_ENCRYPTION_KEY
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass env:BACKUP_ENCRYPTION_KEY \
  -in "$BACKUP_FILE" -out "$RESTORE_FILE"

if [ ! -s "$RESTORE_FILE" ] || ! head -n 5 "$RESTORE_FILE" | grep -q '^-- PostgreSQL database dump'; then
  echo "Error: the decrypted file does not look like a PostgreSQL dump." >&2
  exit 1
fi

docker compose up -d database
ready=0
for attempt in $(seq 1 30); do
  if docker compose exec -T database sh -c \
    'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo "Error: PostgreSQL is not ready; import canceled." >&2
  exit 1
fi

docker compose exec -T database sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" psql --no-password -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' \
  < "$RESTORE_FILE"

rm -f "$RESTORE_FILE"
trap - EXIT HUP INT TERM
unset BACKUP_ENCRYPTION_KEY

docker compose up --build -d
```

After the import, check `docker compose ps` and the application's health endpoint. If `psql` fails, consider the restore **incomplete**: the import may have applied some SQL statements. Keep the original encrypted dump and do not report the service as restored until you have checked the database and the application.

### Tamper detection limitations

The current format uses `openssl enc -aes-256-cbc -pbkdf2`. AES-CBC encrypts the content but does not authenticate the file. A truncated or modified file may fail to decrypt, but a successful decryption does not prove that its content has not been altered. The PostgreSQL header check above is a basic format check, not proof of integrity. Plan a migration to an authenticated encryption format and an associated verification procedure.

### Effects of a full Vault recreation

After `make fclean`, the Vault volume and its key volume are deleted. On restart, initialization recreates Vault and runtime secrets from `.env`; it also generates a new JWT secret if one does not already exist. This may invalidate previous sessions. Secret version history and old Vault tokens are not restored by the PostgreSQL dump.

The current bootstrap stores the unseal shares and root token together in the `vol_vault_keys` volume. This is a known risk: this development procedure does not provide effective separation of Shamir key holders. Grafana credentials are also regenerated when its volume and the Vault volume are new. To retrieve the generated Grafana password, use a private local session and do not save the output to a shared file:

```sh
docker compose exec -it vault sh
```

In the container shell, once Vault is ready:

```sh
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/vault/tls/vault.crt
export VAULT_TOKEN="$(awk '/Initial Root Token:/ {print $4}' /vault/keys/keys.txt)"
vault kv get -field=admin_password secret/runtime/grafana
unset VAULT_TOKEN
```

The command displays a secret on screen: keep this session private and do not copy the result into the repository. Accessing the root token this way is a consequence of the current architecture and should be hardened before any real-world use.

### Full recovery work still needed

To recover the application after losing a workstation or disk, arrange an off-machine encrypted copy, back up uploads if needed, protect Vault keys separately, and periodically test a full restore in a clean environment. Also define the acceptable recovery point objective (RPO) and recovery time objective (RTO).

## Known Limitations

- The application's user experience and accessibility are limited and have not been brought into conformity with applicable French and European accessibility standards.
- HTTPS uses a locally generated self-signed certificate in the development setup.
- The application is a demonstration and is intended for a limited number of users.
- Match records are used as the application's friends/contacts list.


## Demo Users for Manual Testing

The `test_users_seed` service creates these demo accounts on the first stack startup. All accounts use the password `motdepasse123`. The interaction column summarizes the seeded matches, pending likes, and messages, so you can choose an account based on the flow you want to check.

| # | Name | Login email | Username | Kind / orientation | Seeded interactions |
| ---: | --- | --- | --- | --- | --- |
| 1 | Maya | `maya@gmail.com` | `maya_dance` | woman / all | Match with Noah (messages); match with Leila; pending like from Hana |
| 2 | Noah | `noah@gmail.com` | `noah_moves` | man / woman | Match with Maya (messages); match with Sami; pending like from Zoe |
| 3 | Leila | `leila@gmail.com` | `leila_swing` | woman / all | Match with Sami and Maya |
| 4 | Sami | `sami@gmail.com` | `sami_flow` | non_binary / all | Match with Leila and Noah |
| 5 | Clara | `clara@gmail.com` | `clara_steps` | woman / man | Match with Kenji (messages) |
| 6 | Kenji | `kenji@gmail.com` | `kenji_beat` | man / all | Match with Clara (messages) |
| 7 | Iris | `iris@gmail.com` | `iris_salsa` | non_binary / all | Match with Leo |
| 8 | Leo | `leo@gmail.com` | `leo_tango` | man / woman | Match with Iris |
| 9 | Lina | `lina@gmail.com` | `lina_groove` | woman / all | Match with Adam |
| 10 | Adam | `adam@gmail.com` | `adam_rock` | man / all | Match with Lina |
| 11 | Naima | `naima@gmail.com` | `naima_latina` | woman / man | Match with Robin |
| 12 | Robin | `robin@gmail.com` | `robin_wave` | non_binary / all | Match with Naima |
| 13 | Hana | `hana@gmail.com` | `hana_kpop` | woman / all | Pending like to Maya |
| 14 | Malik | `malik@gmail.com` | `malik_pop` | man / woman | Pending like to Maya |
| 15 | Zoe | `zoe@gmail.com` | `zoe_vibes` | woman / all | Pending like to Noah |

The seed script also creates profiles and avatars. These are demonstration credentials; do not reuse them outside a local test environment. For database backup and restoration instructions, see the [Database Backup and Recovery section](#database-backup-and-recovery).
