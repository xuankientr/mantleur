# PostgreSQL Local Setup Guide

## Option 1: Use Docker PostgreSQL (Recommended)

1. Install Docker Desktop
2. Run PostgreSQL container:
```bash
docker run --name mantleur-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mantleur_db -p 5432:5432 -d postgres:15
```

3. Update DATABASE_URL in backend/.env:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mantleur_db"
```

## Option 2: Install PostgreSQL locally

1. Download PostgreSQL from https://www.postgresql.org/download/
2. Install with default settings
3. Create database:
```sql
CREATE DATABASE mantleur_db;
CREATE USER mantleur_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mantleur_db TO mantleur_user;
```

4. Update DATABASE_URL in backend/.env:
```
DATABASE_URL="postgresql://mantleur_user:password@localhost:5432/mantleur_db"
```

## Option 3: Use Supabase (Free PostgreSQL)

1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Update DATABASE_URL in backend/.env

## After setup:

1. Run migration:
```bash
npx prisma migrate deploy
```

2. Seed database:
```bash
node seed-production-database.js
```

3. Test connection:
```bash
node test-postgresql-connection.js
```
