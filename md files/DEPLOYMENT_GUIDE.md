# Deployment Guide - Running on Another Server/Computer

This guide will help you deploy and run the Customer Ticketing Tool on another server or computer, making it accessible from other devices on your network.

## 📋 Prerequisites

1. **Node.js** (v16 or higher) installed on the server
2. **MySQL Server** installed and running on the server
3. **Network access** to the server (same network or public IP)

---

## 🚀 Step-by-Step Deployment

### Step 1: Transfer Project to Server

**Option A: Using Git (Recommended)**
```bash
# On the server, clone your repository
git clone <your-repo-url>
cd Customer_Ticketing_Tool
```

**Option B: Using File Transfer**
- Copy the entire project folder to the server using:
  - USB drive
  - Network share
  - FTP/SFTP
  - Cloud storage (Google Drive, Dropbox, etc.)

---

### Step 2: Find Server IP Address

**On Windows Server:**
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**On Linux Server:**
```bash
ip addr show
# or
hostname -I
```

**Note the IP address** - you'll need it for configuration (e.g., `192.168.1.100`)

---

### Step 3: Set Up MySQL Database

1. **Create Database:**
```sql
CREATE DATABASE customer_ticketing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Import SQL Files:**
   - Import all your `.sql` files in order:
     - Schema files first
     - Then seed/data files

3. **Create MySQL User (Optional but Recommended):**
```sql
CREATE USER 'ticketing_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON customer_ticketing_db.* TO 'ticketing_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Step 4: Configure Backend Environment

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=root                    # or 'ticketing_user' if you created one
DB_PASSWORD=your_mysql_password
DB_NAME=customer_ticketing_db
DB_PORT=3306

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (use server IP address)
FRONTEND_URL=http://192.168.1.100:3000
# If accessing from internet, use your public IP or domain:
# FRONTEND_URL=http://your-domain.com
```

**Important:** Replace `192.168.1.100` with your actual server IP address!

---

### Step 5: Configure Frontend Environment

Create `frontend/.env` file:

```env
# Backend API URL (use server IP address)
REACT_APP_API_URL=http://192.168.1.100:5000/api

# If accessing from internet:
# REACT_APP_API_URL=http://your-domain.com:5000/api
```

**Important:** Replace `192.168.1.100` with your actual server IP address!

---

### Step 6: Install Dependencies

**On the server, run:**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 7: Build Frontend (Production)

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build` folder.

---

### Step 8: Configure Firewall

**Windows Firewall:**
```powershell
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Linux Firewall (UFW):**
```bash
sudo ufw allow 5000/tcp
sudo ufw allow 3000/tcp
sudo ufw reload
```

---

### Step 9: Start the Application

**Option A: Development Mode (for testing)**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev    # or npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Option B: Production Mode (Recommended)**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Serve Frontend Build:**
```bash
# Install serve globally (one time)
npm install -g serve

# Serve the built frontend
cd frontend
serve -s build -l 3000
```

---

### Step 10: Access from Other Devices

**On the same network:**
- Open browser on any device
- Go to: `http://192.168.1.100:3000`
- Replace `192.168.1.100` with your server's IP

**From Internet (if server has public IP):**
- Use your public IP address or domain name
- Make sure port forwarding is configured on your router

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to server"

**Solutions:**
1. Check if server is running: `netstat -an | findstr :5000` (Windows) or `netstat -tulpn | grep 5000` (Linux)
2. Verify firewall allows connections
3. Check if IP address is correct
4. Ensure both backend and frontend are running

### Issue: "Database connection failed"

**Solutions:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check database credentials in `backend/.env`
3. Ensure database exists: `SHOW DATABASES;`
4. Test connection: `mysql -u root -p customer_ticketing_db`

### Issue: "CORS error"

**Solutions:**
1. Update `FRONTEND_URL` in `backend/.env` to match the actual frontend URL
2. If accessing from different port, add it to CORS allowed origins

### Issue: "Network timeout"

**Solutions:**
1. Check server IP address is correct
2. Verify firewall rules
3. Ensure server is on the same network (or has public access)
4. Check if ports are not blocked by ISP

---

## 📝 Quick Reference

**Backend URL:** `http://[SERVER_IP]:5000`  
**Frontend URL:** `http://[SERVER_IP]:3000`  
**API Endpoint:** `http://[SERVER_IP]:5000/api`

**Default Ports:**
- Backend: `5000`
- Frontend: `3000`
- MySQL: `3306`

---

## 🔒 Security Recommendations

1. **Change default passwords** in production
2. **Use strong JWT_SECRET** (at least 32 characters)
3. **Enable HTTPS** for production (use reverse proxy like Nginx)
4. **Restrict database access** to localhost only
5. **Use environment variables** for all sensitive data
6. **Keep dependencies updated** regularly

---

## 🎯 Next Steps

After deployment:
1. Test login functionality
2. Create test tickets
3. Verify all features work
4. Set up automatic startup (PM2, systemd, etc.)
5. Configure domain name (if needed)
6. Set up SSL certificate (for HTTPS)

---

## 📞 Need Help?

If you encounter issues:
1. Check server logs (backend terminal)
2. Check browser console (F12)
3. Verify all environment variables are set correctly
4. Ensure MySQL is running and accessible

