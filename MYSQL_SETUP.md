# MySQL Database Setup Guide

## Overview
Proyek ini telah diubah dari SQLite/PostgreSQL ke MySQL untuk konsistensi dan performa yang lebih baik.

## Prerequisites
- Docker dan Docker Compose terinstall
- Node.js dan npm terinstall

## Setup Instructions

### 1. Start MySQL Container
```bash
docker-compose up -d
```

Ini akan menjalankan:
- MySQL 8.0 server di port 3306
- phpMyAdmin di port 8080 untuk manajemen database

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` ke `.env` dan sesuaikan jika diperlukan:
```bash
cp .env.example .env
```

Pastikan `DATABASE_URL` sudah benar:
```
DATABASE_URL="mysql://ppdb_user:ppdb_password@localhost:3306/ppdb_smk"
```

### 4. Generate Prisma Client
```bash
npm run db:generate
```

### 5. Push Database Schema
```bash
npm run db:push
```

### 6. Seed Database (Optional)
```bash
npm run db:seed
```

### 7. Start Development Server
```bash
npm run dev
```

## Database Access

### phpMyAdmin
- URL: http://localhost:8080
- Server: mysql
- Username: ppdb_user
- Password: ppdb_password

### Direct MySQL Connection
- Host: localhost
- Port: 3306
- Database: ppdb_smk
- Username: ppdb_user
- Password: ppdb_password

## Troubleshooting

### Container Issues
```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Database Connection Issues
1. Pastikan container MySQL sudah running: `docker ps`
2. Check logs: `docker-compose logs mysql`
3. Verify environment variables di `.env`

### Migration Issues
```bash
# Reset database (WARNING: This will delete all data)
npm run db:push -- --force-reset

# Re-seed database
npm run db:seed
```

## Changes Made

1. **docker-compose.yml**: Changed from PostgreSQL to MySQL 8.0
2. **prisma/schema.prisma**: Updated provider from "sqlite" to "mysql"
3. **package.json**: Added mysql2 dependency
4. **.env**: Updated DATABASE_URL to MySQL connection string
5. **mysql-init/**: Added initialization scripts for MySQL

## Notes

- MySQL menggunakan port 3306 (default)
- phpMyAdmin menggantikan Adminer untuk manajemen database
- Data disimpan dalam Docker volume `mysql_data`
- Authentication menggunakan mysql_native_password untuk kompatibilitas