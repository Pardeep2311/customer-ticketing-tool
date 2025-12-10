-- SIMPLE FIX for Duplicate Index Error
-- Run these commands one by one in MySQL

USE customer_ticketing_db;

-- Step 1: Drop the foreign keys (run these even if you get an error - that's okay)
ALTER TABLE tickets DROP FOREIGN KEY tickets_ibfk_assignment_group;
ALTER TABLE tickets DROP FOREIGN KEY tickets_ibfk_subcategory;

-- Step 2: Drop the indexes (run these even if you get an error - that's okay)
ALTER TABLE tickets DROP INDEX idx_assignment_group;
ALTER TABLE tickets DROP INDEX idx_subcategory;

-- Step 3: Now add everything back (this should work without errors)
ALTER TABLE tickets 
ADD INDEX idx_assignment_group (assignment_group_id),
ADD INDEX idx_subcategory (subcategory_id),
ADD CONSTRAINT tickets_ibfk_assignment_group 
  FOREIGN KEY (assignment_group_id) REFERENCES assignment_groups(id) ON DELETE SET NULL,
ADD CONSTRAINT tickets_ibfk_subcategory 
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL;

-- Done! The indexes and foreign keys are now properly created.

