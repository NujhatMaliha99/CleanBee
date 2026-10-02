# CleanBee

CleanBee is a community waste-management platform that connects residents, volunteers, and administrators. Residents can submit pickup requests and area reports, volunteers can claim and complete collection tasks, and administrators can review photos, pickup requests, volunteer claims, and reports from one dashboard.

## Live application

- Application: <http://cleanbee.austattendance.online>
- Health endpoint: <http://cleanbee.austattendance.online/api/health>
- Repository: <https://github.com/NujhatMaliha99/CleanBee>

## Team

| Student ID | Name |
| --- | --- |
| 20230204063 | Nujhat Tabassum Maliha |
| 20230204071 | Israt Jahan |
| 20230204072 | Arina Afrin Arni |
| 20230204073 | Atia Fairuz |

## Features

- Registration, login, logout, email verification, and profile management
- Pickup request creation, cancellation, status tracking, and photo upload
- Volunteer mode, availability, task claiming, and task completion workflow
- Area reporting and status tracking
- Eco-points, rewards, redemption history, and notifications
- Dedicated administrator login and database-backed approval dashboard
- Role-based authorization for users, volunteers, and administrators

## Architecture

The React single-page application calls Laravel REST endpoints under `/api`. Laravel applies validation, authentication, authorization, and business rules before reading or writing MySQL. In production, Nginx serves the compiled React application from Laravel's `public/app` directory and forwards PHP requests to the team's PHP-FPM socket. Application data is stored in the shared `cse3100-db` MySQL container using the dedicated `cleanbee_db` database and non-root `cleanbee` account.

## Technology stack

- Frontend: React, React Router, Vite, CSS
- Backend: PHP 8.4, Laravel, Sanctum
- Database: MySQL 8
- Local containers: Docker Compose, separate frontend, backend, and MySQL services
- Production: Ubuntu, Nginx, PHP-FPM, shared MySQL Docker container
- CI/CD: GitHub Actions, SSH, SCP

## Prerequisites

Choose either Docker or the native setup.

### Docker setup

- Docker Desktop with Docker Compose

### Native setup

- PHP 8.2 or later with `pdo_mysql`, `mbstring`, and OpenSSL
- Composer 2
- Node.js 22 and npm
- MySQL 8
- Git

## Local setup with Docker

1. Clone the repository and enter it:

   ```bash
   git clone https://github.com/NujhatMaliha99/CleanBee.git
   cd CleanBee
   ```

2. Copy `.env.example` to `.env`, generate `APP_KEY`, and set administrator and optional SMTP values. Never commit `.env`.

3. Build and start the services:

   ```bash
   docker compose up --build -d
   ```

4. Open the frontend at <http://localhost:5173>. The backend API is at <http://localhost:8000/api> and MySQL is exposed on port `3308`.

5. Stop the environment with:

   ```bash
   docker compose down
   ```

## Local setup without Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/NujhatMaliha99/CleanBee.git
   cd CleanBee
   ```

2. Install dependencies and create the environment file:

   ```bash
   composer install
   npm ci
   cp .env.example .env
   php artisan key:generate
   ```

3. Create a MySQL database and configure `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env`. Detailed SQL is available in [docs/mysql-setup.md](docs/mysql-setup.md).

4. Run migrations and seed the administrator:

   ```bash
   php artisan migrate
   php artisan db:seed --class=AdminUserSeeder
   ```

5. Start Laravel and Vite in separate terminals:

   ```bash
   php artisan serve
   ```

   ```bash
   npm run dev
   ```

6. Open <http://localhost:5173>.

## Testing

```bash
php artisan test
npx eslint src
npm run build
```

Backend tests use an isolated in-memory SQLite database. Application environments use MySQL.

## Production deployment

Production deployment is automated. Do not run Composer, npm, or a Node development server on the course VPS.

### One-time server preparation

1. Create `~/laravel` and a production `.env` on the VPS. Set `APP_ENV=production`, `APP_DEBUG=false`, live URLs, SMTP settings, administrator credentials, and the dedicated MySQL connection.
2. Reuse `cse3100-db`. Create `cleanbee_db` and grant it to the non-root `cleanbee` MySQL user.
3. Configure `/etc/nginx/sites-available/cleanbee.austattendance.online` with root `/home/s20230204063/laravel/public`, PHP-FPM socket `/run/php/php8.4-fpm-s20230204063.sock`, and SPA fallback `/app/index.html`.
4. Verify and reload Nginx:

   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Add the deployment public key to `~/.ssh/authorized_keys`. Store only its private key in the GitHub Actions secret `SSH_PRIVATE_KEY`.

### Automated release process

Every push to `main` runs `.github/workflows/deploy.yml`. It:

1. Installs PHP dependencies and runs Laravel tests.
2. Installs Node dependencies and builds React into `public/app`.
3. Packages the release and copies it to the VPS with SCP.
4. Extracts it into `~/laravel` without replacing the server-managed `.env`.
5. Writes the deployed Git commit to `DEPLOYED_COMMIT`.
6. Runs migrations, seeds the administrator, creates the storage link, and optimizes Laravel.

Verify the release with:

```bash
curl http://cleanbee.austattendance.online/api/health
```

The returned `commit_sha` must match the latest commit on `main`.

## Security notes

- Never commit `.env`, database passwords, SMTP credentials, or SSH private keys.
- Production uses a dedicated non-root MySQL user.
- Laravel authorization and role middleware protect volunteer and administrator endpoints.
- Email verification is controlled by `REQUIRE_EMAIL_VERIFICATION` and `VITE_REQUIRE_EMAIL_VERIFICATION`.
