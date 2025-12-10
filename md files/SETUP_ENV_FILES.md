e# Environment Variables Setup Guide

This guide will help you create the necessary `.env` files for the Customer Ticketing Tool project.

## 📋 Overview

The project requires two `.env` files:
1. **backend/.env** - Backend server configuration
2. **frontend/.env** - Frontend API configuration

**Important**: These files are in `.gitignore` and will NOT be committed to GitHub for security reasons.

---

## 🔧 Backend .env File

### Location
Create file: `backend/.env`

### Content Template

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=customer_ticketing_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (generate a random string for production)
# You can generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Configuration Details

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL server host | `localhost` | Yes |
| `DB_USER` | MySQL username | `root` | Yes |
| `DB_PASSWORD` | MySQL password | (empty) | Yes* |
| `DB_NAME` | Database name | `customer_ticketing_db` | Yes |
| `PORT` | Backend server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `JWT_SECRET` | Secret key for JWT tokens | (none) | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |

*Required if your MySQL has a password set

### Quick Setup (PowerShell)

```powershell
# Navigate to backend directory
cd backend

# Create .env file
@"
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=customer_ticketing_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Frontend URL
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding utf8
```

### Quick Setup (Bash/Linux/Mac)

```bash
# Navigate to backend directory
cd backend

# Create .env file
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=customer_ticketing_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Frontend URL
FRONTEND_URL=http://localhost:3000
EOF
```

---

## 🎨 Frontend .env File

### Location
Create file: `frontend/.env`

### Content Template

```env
# API Configuration
# For local development, this defaults to http://localhost:5000/api
# Only set this if you need to use a different API URL
REACT_APP_API_URL=http://localhost:5000/api
```

### Configuration Details

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` | No |

**Note**: If you don't create this file, the frontend will default to `http://localhost:5000/api`

### Quick Setup (PowerShell)

```powershell
# Navigate to frontend directory
cd frontend

# Create .env file
@"
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath ".env" -Encoding utf8
```

### Quick Setup (Bash/Linux/Mac)

```bash
# Navigate to frontend directory
cd frontend

# Create .env file
cat > .env << 'EOF'
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
EOF
```

---

## 🔐 Security Best Practices

### 1. Never Commit .env Files
- ✅ `.env` files are already in `.gitignore`
- ❌ Never manually add them to Git
- ✅ Use `.env.example` files as templates (without sensitive data)

### 2. Generate Strong JWT Secret

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Using Online Generator:**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" (256-bit)

### 3. Use Different Secrets for Production

- Development: Can use simple secrets
- Production: Must use strong, randomly generated secrets
- Staging: Use different secrets from production

---

## 🧪 Testing Your Configuration

### Test Backend Connection

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check for errors:**
   - ✅ Should see: "✅ Database connected successfully"
   - ❌ If error: Check your `DB_PASSWORD` and MySQL is running

### Test Frontend Connection

1. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

2. **Check browser console:**
   - ✅ No CORS errors
   - ✅ API calls succeed
   - ❌ If errors: Check `REACT_APP_API_URL` matches backend URL

---

## 🌐 Network Access (Optional)

If you want to access the app from other devices on your network:

### Backend .env
```env
# Add your local IP address to CORS
FRONTEND_URL=http://192.168.1.100:3000
```

### Frontend .env
```env
# Use your computer's IP address
REACT_APP_API_URL=http://192.168.1.100:5000/api
```

**Find your IP address:**
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Linux/Mac**: `ifconfig` or `ip addr`

---

## 🔄 Updating Environment Variables

### After Changing .env Files

1. **Backend**: Restart the server
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Frontend**: Restart the dev server
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   npm start
   ```

**Note**: React requires a full restart to pick up new environment variables.

---

## 📝 Example .env Files

### Complete Backend .env Example

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=customer_ticketing_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (64 character random string)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Complete Frontend .env Example

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ❓ Troubleshooting

### Problem: Database connection fails

**Solution:**
1. Check MySQL is running: `mysql -u root -p`
2. Verify `DB_PASSWORD` is correct
3. Ensure database exists: `SHOW DATABASES;`
4. Check `DB_NAME` matches your database name

### Problem: CORS errors in browser

**Solution:**
1. Check `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Ensure backend server is running
3. Check browser console for specific CORS error

### Problem: API calls fail

**Solution:**
1. Verify `REACT_APP_API_URL` in frontend `.env`
2. Check backend is running on correct port
3. Test backend directly: `http://localhost:5000/api/health`

### Problem: JWT authentication fails

**Solution:**
1. Ensure `JWT_SECRET` is set in backend `.env`
2. Restart backend server after changing JWT_SECRET
3. Clear browser localStorage and login again

---

## ✅ Verification Checklist

Before running the application, verify:

- [ ] `backend/.env` file exists
- [ ] `DB_PASSWORD` is set (if MySQL has password)
- [ ] `JWT_SECRET` is set in backend `.env`
- [ ] `frontend/.env` file exists (optional, has defaults)
- [ ] MySQL database is created
- [ ] MySQL server is running
- [ ] Ports 3000 and 5000 are available

---

## 📚 Additional Resources

- [MySQL Installation Guide](https://dev.mysql.com/doc/refman/8.0/en/installing.html)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

**Need Help?** Check the main [README.md](./README.md) for complete setup instructions.

