# 🔧 Database Connection Setup Guide

## 🚨 Current Issue
Error: `Authentication failed against database server at localhost, the provided database credentials for postgres are not valid.`

## 📋 Solutions

### Option 1: Check Your PostgreSQL Credentials

1. **Open PostgreSQL Command Line (psql)**:
   ```bash
   psql -U postgres -h localhost
   ```

2. **If you can connect, note your actual credentials**

3. **Update `.env` file with correct credentials**:
   ```env
   DATABASE_URL="postgresql://[your_username]:[your_password]@localhost:5432/ppdb_smk"
   ```

### Option 2: Create Database and User

1. **Connect to PostgreSQL as superuser**:
   ```sql
   -- Create database
   CREATE DATABASE ppdb_smk;
   
   -- Create user (optional)
   CREATE USER ppdb_user WITH PASSWORD 'your_secure_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE ppdb_smk TO ppdb_user;
   ```

2. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://ppdb_user:your_secure_password@localhost:5432/ppdb_smk"
   ```

### Option 3: Use Default PostgreSQL Setup

**Common default credentials:**
- Username: `postgres`
- Password: (empty) or `postgres` or `admin`
- Port: `5432`

**Try these DATABASE_URL variations:**
```env
# No password
DATABASE_URL="postgresql://postgres@localhost:5432/ppdb_smk"

# Password: postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ppdb_smk"

# Password: admin
DATABASE_URL="postgresql://postgres:admin@localhost:5432/ppdb_smk"
```

### Option 4: Reset PostgreSQL Password

1. **Find PostgreSQL config file** (`pg_hba.conf`)
2. **Change authentication method to `trust`** temporarily
3. **Restart PostgreSQL service**
4. **Connect and change password**:
   ```sql
   ALTER USER postgres PASSWORD 'new_password';
   ```
5. **Restore authentication method**

## 🧪 Test Connection

After updating `.env`, test with:
```bash
node test-db-connection.js
```

## 🔄 Apply Changes

```bash
npx prisma generate
npx prisma db push
npm run dev
```

## 📝 Common PostgreSQL Commands

```sql
-- List databases
\l

-- List users
\du

-- Connect to database
\c ppdb_smk

-- List tables
\dt

-- Exit
\q
```