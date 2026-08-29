# MySQL setup

CleanBee uses MySQL for its application database. SQLite remains configured only for the isolated automated test environment in `phpunit.xml`.

## Requirements

- MySQL 8 or a compatible MariaDB release
- PHP with the `pdo_mysql` extension enabled
- An empty database for CleanBee

## Create the database

Run the following SQL with an authorized MySQL account:

```sql
CREATE DATABASE cleanbee
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

For shared or production environments, create a dedicated database user instead of using the MySQL root account:

```sql
CREATE USER 'cleanbee_user'@'%' IDENTIFIED BY 'replace-with-a-strong-password';
GRANT ALL PRIVILEGES ON cleanbee.* TO 'cleanbee_user'@'%';
FLUSH PRIVILEGES;
```

## Configure Laravel

Copy `.env.example` to `.env`, generate the application key, and set the connection values for the local environment:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cleanbee
DB_USERNAME=root
DB_PASSWORD=
```

Do not commit `.env` or real database credentials.

## Run migrations

```bash
php artisan config:clear
php artisan migrate
```

The migrations create the authentication, pickup request, and photo verification tables required by the application.

## Verify the connection

```bash
php artisan migrate:status
```

You can also verify the tables from MySQL:

```sql
USE cleanbee;
SHOW TABLES;
```

Expected application tables include `users`, `personal_access_tokens`, `pickup_requests`, and `pickup_photos`.
