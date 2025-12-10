# How to Login to Admin Dashboard

## Method 1: Using the Node.js Script (Recommended)

This is the easiest way to create an admin user:

1. **Open a terminal in the backend folder:**
   ```bash
   cd backend
   ```

2. **Run the createAdmin script:**
   ```bash
   node scripts/createAdmin.js
   ```
   
   This will create an admin user with:
   - **Email:** `admin@cantik.com`
   - **Password:** `admin123`

3. **To create a custom admin user:**
   ```bash
   node scripts/createAdmin.js "Your Name" "your-email@example.com" "your-password"
   ```

4. **Login at:** `http://localhost:3000/login`
   - Use the email and password you created

---

## Method 2: Using SQL Directly

1. **Open MySQL command line or phpMyAdmin**

2. **Run this SQL:**
   ```sql
   USE customer_ticketing_db;
   
   INSERT INTO users (name, email, password, role) VALUES
   ('Admin User', 'admin@cantik.com', '$2b$10$MbR8OA4mAno65moPZDF71.YlFRIfHrDlpY5PXZIpRhSgEoPSAXbOe', 'admin');
   ```

3. **Login credentials:**
   - **Email:** `admin@cantik.com`
   - **Password:** `admin123`

---

## Method 3: Update Existing User to Admin

If you already have a user account and want to make it admin:

1. **Run this SQL:**
   ```sql
   USE customer_ticketing_db;
   
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

2. **Then login with your existing credentials**

---

## After Creating Admin User

1. **Start the backend server** (if not running):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (if not running):
   ```bash
   cd frontend
   npm start
   ```

3. **Go to:** `http://localhost:3000/login`

4. **Login with your admin credentials**

5. **You'll be redirected to:** `/admin/dashboard`

---

## Troubleshooting

### "User already exists" error
- Delete the existing user first:
  ```sql
  DELETE FROM users WHERE email = 'admin@cantik.com';
  ```
- Or use a different email address

### "Cannot connect to database"
- Make sure MySQL is running
- Check your `.env` file in the backend folder
- Verify database credentials

### "Access denied" after login
- Make sure the user's role is set to `'admin'` (not `'Admin'` or `'ADMIN'`)
- Check the database: `SELECT email, role FROM users WHERE email = 'your-email@example.com';`

---

## Default Admin Credentials (if using SQL method)

- **Email:** `admin@cantik.com`
- **Password:** `admin123`

⚠️ **Important:** Change the password after first login in production!

