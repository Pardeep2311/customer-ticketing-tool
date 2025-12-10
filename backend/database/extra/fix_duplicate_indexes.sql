-- Fix Duplicate Index Error
-- This script safely removes and recreates indexes/constraints
-- Run this to fix the "Duplicate key name" error

USE customer_ticketing_db;

-- Step 1: Drop foreign keys first (they depend on indexes)
-- Check if foreign keys exist and drop them
SET @fk1 = (SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = 'customer_ticketing_db' 
              AND TABLE_NAME = 'tickets' 
              AND CONSTRAINT_NAME = 'tickets_ibfk_assignment_group'
            LIMIT 1);

SET @fk2 = (SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = 'customer_ticketing_db' 
              AND TABLE_NAME = 'tickets' 
              AND CONSTRAINT_NAME = 'tickets_ibfk_subcategory'
            LIMIT 1);

-- Drop foreign keys if they exist
SET @sql = IF(@fk1 IS NOT NULL, 
    CONCAT('ALTER TABLE tickets DROP FOREIGN KEY ', @fk1), 
    'SELECT "FK tickets_ibfk_assignment_group does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@fk2 IS NOT NULL, 
    CONCAT('ALTER TABLE tickets DROP FOREIGN KEY ', @fk2), 
    'SELECT "FK tickets_ibfk_subcategory does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Drop indexes if they exist
SET @idx1 = (SELECT INDEX_NAME 
             FROM INFORMATION_SCHEMA.STATISTICS 
             WHERE TABLE_SCHEMA = 'customer_ticketing_db' 
               AND TABLE_NAME = 'tickets' 
               AND INDEX_NAME = 'idx_assignment_group'
             LIMIT 1);

SET @idx2 = (SELECT INDEX_NAME 
             FROM INFORMATION_SCHEMA.STATISTICS 
             WHERE TABLE_SCHEMA = 'customer_ticketing_db' 
               AND TABLE_NAME = 'tickets' 
               AND INDEX_NAME = 'idx_subcategory'
             LIMIT 1);

-- Drop indexes if they exist
SET @sql = IF(@idx1 IS NOT NULL, 
    CONCAT('ALTER TABLE tickets DROP INDEX ', @idx1), 
    'SELECT "Index idx_assignment_group does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@idx2 IS NOT NULL, 
    CONCAT('ALTER TABLE tickets DROP INDEX ', @idx2), 
    'SELECT "Index idx_subcategory does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Now safely add indexes back
ALTER TABLE tickets 
ADD INDEX idx_assignment_group (assignment_group_id),
ADD INDEX idx_subcategory (subcategory_id);

-- Step 4: Add foreign keys back
ALTER TABLE tickets 
ADD CONSTRAINT tickets_ibfk_assignment_group 
  FOREIGN KEY (assignment_group_id) REFERENCES assignment_groups(id) ON DELETE SET NULL;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_ibfk_subcategory 
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL;

-- Verify the indexes and foreign keys were created
SELECT 'Indexes and Foreign Keys created successfully!' AS status;
SHOW INDEXES FROM tickets WHERE Key_name IN ('idx_assignment_group', 'idx_subcategory');
