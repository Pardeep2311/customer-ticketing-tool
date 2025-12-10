-- Fix Sample Data - Use this if you get foreign key errors
-- This script finds the admin user and uses their ID

USE customer_ticketing_db;

-- Get admin user ID (or create one if doesn't exist)
SET @admin_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1);

-- If no admin exists, create one (password: admin123)
-- You'll need to hash this password properly in production
INSERT INTO users (name, email, password, role) 
SELECT 'Admin User', 'admin@cantik.com', '$2a$10$YourHashedPasswordHere', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin' LIMIT 1);

SET @admin_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1);

-- Insert Sample Knowledge Articles with correct author_id
INSERT INTO knowledge_articles (title, content, category_id, author_id, views, helpful_count) 
SELECT 
  'How to Reset Your Password', 
  'Step-by-step guide to reset your password:\n\n1. Go to login page\n2. Click "Forgot Password"\n3. Enter your email\n4. Check your email for reset link\n5. Click link and set new password', 
  1, 
  @admin_id, 
  150, 
  45
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_articles WHERE title = 'How to Reset Your Password'
);

INSERT INTO knowledge_articles (title, content, category_id, author_id, views, helpful_count) 
SELECT 
  'Troubleshooting Login Issues', 
  'Common login problems and solutions:\n\n- Forgot password: Use password reset\n- Account locked: Contact support\n- Browser issues: Clear cache and cookies', 
  2, 
  @admin_id, 
  200, 
  60
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_articles WHERE title = 'Troubleshooting Login Issues'
);

-- Verify the data
SELECT 'Knowledge Articles Created:' as Status;
SELECT id, title, author_id FROM knowledge_articles;

SELECT 'Admin User ID:' as Info, @admin_id as admin_id;

