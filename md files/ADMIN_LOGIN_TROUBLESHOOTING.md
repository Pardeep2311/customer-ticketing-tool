# 🔧 Admin Login Troubleshooting Guide

## Quick Fix Steps

### Step 1: Check if Admin User Exists

Run this in your backend folder:
```bash
node scripts/testAdminLogin.js
```

This will tell you:
- ✅ If admin user exists
- ✅ If password is correct
- ❌ What's wrong if login fails

### Step 2: Create Admin User (if missing)

If no admin user exists, run:
```bash
node scripts/createAdmin.js
```

This creates:
- Email: `admin@cantik.com`
- Password: `admin123`

### Step 3: Check Backend is Running

Make sure your backend server is running:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Database connected successfully
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for any error messages

Look for:
- `Login successful:` - Shows user data and role
- `Redirecting based on role:` - Shows where it's trying to go
- Any error messages

### Step 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the `/api/auth/login` request
5. Check:
   - Status code (should be 200)
   - Response body (should have `success: true`)
   - Request payload (email and password)

## Common Issues & Solutions

### Issue 1: "Invalid email or password"

**Possible causes:**
- Admin user doesn't exist
- Password is wrong
- Password hash is incorrect

**Solution:**
1. Delete existing admin user:
   ```sql
   DELETE FROM users WHERE email = 'admin@cantik.com';
   ```
2. Create new admin:
   ```bash
   node scripts/createAdmin.js
   ```

### Issue 2: "Cannot connect to server"

**Possible causes:**
- Backend not running
- Wrong API URL
- CORS issue

**Solution:**
1. Check backend is running on port 5000
2. Check `.env` file has correct `FRONTEND_URL`
3. Check browser console for CORS errors

### Issue 3: Login succeeds but redirects to wrong page

**Possible causes:**
- User role is not 'admin'
- ProtectedRoute blocking access

**Solution:**
1. Check browser console for role information
2. Verify user role in database:
   ```sql
   SELECT email, role FROM users WHERE email = 'admin@cantik.com';
   ```
   Should show `role = 'admin'` (not 'Admin' or 'ADMIN')

### Issue 4: Token not being saved

**Possible causes:**
- localStorage blocked
- Token not in response

**Solution:**
1. Check browser console for token
2. Check Application tab → Local Storage
3. Should see `token` and `user` entries

## Manual Database Check

Run this SQL to check admin user:

```sql
USE customer_ticketing_db;

-- Check admin users
SELECT id, name, email, role, is_active, 
       LENGTH(password) as password_length
FROM users 
WHERE role = 'admin';

-- Check specific admin
SELECT * FROM users WHERE email = 'admin@cantik.com';
```

## Test Admin Login Manually

You can test the login API directly:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cantik.com","password":"admin123"}'
```

Should return:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@cantik.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Still Not Working?

1. **Check backend terminal** for error messages
2. **Check browser console** for JavaScript errors
3. **Check Network tab** for failed requests
4. **Verify database connection** is working
5. **Try creating a new admin user** with different email

## Quick Test Script

Run this to test everything:

```bash
# In backend folder
node scripts/testAdminLogin.js
```

This will tell you exactly what's wrong!

