-- MySQL Database Initialization Script
-- This script will be executed when the MySQL container starts for the first time

-- Create database if not exists (already handled by MYSQL_DATABASE env var)
-- USE ppdb_smk;

-- Set charset and collation
ALTER DATABASE ppdb_smk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to user
GRANT ALL PRIVILEGES ON ppdb_smk.* TO 'ppdb_user'@'%';
FLUSH PRIVILEGES;

-- Optional: Create additional users or configurations here
-- Example: CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'readonly_password';
-- Example: GRANT SELECT ON ppdb_smk.* TO 'readonly_user'@'%';