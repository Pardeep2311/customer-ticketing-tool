-- Check if password column exists and its structure
-- Run this in MySQL to verify the password column

USE customer_ticketing_db;

-- Check table structure
DESCRIBE users;

-- Check if password column exists and is NOT NULL
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'customer_ticketing_db' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'password';

-- If password column doesn't exist or is NULL, run this:
-- ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL;

