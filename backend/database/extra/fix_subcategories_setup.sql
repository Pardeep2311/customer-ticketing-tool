-- Fix Subcategories Setup
-- This script ensures subcategories table and data are properly set up
-- Run this if you're getting foreign key constraint errors when creating tickets

USE customer_ticketing_db;

-- 1. Create subcategories table if it doesn't exist
CREATE TABLE IF NOT EXISTS subcategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subcategory (category_id, name),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add subcategory_id column to tickets table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'tickets';
SET @columnname = 'subcategory_id';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER category_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Drop existing foreign key if it exists (to recreate it properly)
SET @fk_name = 'tickets_ibfk_5';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fk_name)
      AND (constraint_type = 'FOREIGN KEY')
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP FOREIGN KEY ', @fk_name),
  'SELECT 1' -- Foreign key doesn't exist, do nothing
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. Add foreign key for subcategory_id
SET @fk_name = 'tickets_ibfk_5';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fk_name)
      AND (constraint_type = 'FOREIGN KEY')
  ) > 0,
  'SELECT 1', -- Foreign key exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fk_name, ' FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 5. Add index for subcategory_id if it doesn't exist
SET @index_name = 'idx_subcategory';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @index_name)
  ) > 0,
  'SELECT 1', -- Index exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @index_name, ' (subcategory_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 6. Insert/Update Subcategories for Technical Support category
-- Get the Technical Support category ID
SET @tech_support_id = (SELECT id FROM categories WHERE name = 'Technical Support' LIMIT 1);

-- Only insert if Technical Support category exists
INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'Installation Issues', 'Problems with software or hardware installation'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'WiFi/Network Connectivity', 'WiFi connection and network connectivity problems'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'System Issues', 'Operating system errors and system crashes'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'Hardware Problems', 'Physical device issues - laptop, desktop, printer, etc.'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'Software Issues', 'Application errors and software problems'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'Driver Problems', 'Device driver installation and compatibility issues'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'Performance Issues', 'Slow performance, freezing, lagging problems'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO subcategories (category_id, name, description) 
SELECT @tech_support_id, 'Configuration Problems', 'Device settings and configuration issues'
WHERE @tech_support_id IS NOT NULL
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 7. Show current subcategories
SELECT 
    s.id,
    s.category_id,
    c.name as category_name,
    s.name as subcategory_name,
    s.description
FROM subcategories s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY s.category_id, s.name;

