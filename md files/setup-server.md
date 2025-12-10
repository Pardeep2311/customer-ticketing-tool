# Quick Server Setup Guide

## 🎯 Quick Steps to Run on Another Server/Computer

### 1. Find Your Server IP Address

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" - e.g., 192.168.1.100
```

**Linux/Mac:**
```bash
ifconfig
# or
hostname -I
```

**Write down this IP address!** (Example: `192.168.1.100`)

---

### 2. Configure Backend

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=customer_ticketing_db
DB_PORT=3306

JWT_SECRET=change_this_to_random_string_12345
FRONTEND_URL=http://YOUR_SERVER_IP:3000
```

**Replace `YOUR_SERVER_IP` with your actual IP** (e.g., `192.168.1.100`)

---

### 3. Configure Frontend

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://YOUR_SERVER_IP:5000/api
```

**Replace `YOUR_SERVER_IP` with your actual IP** (e.g., `192.168.1.100`)

---

### 4. Install & Run

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
cd frontend
npm start
```

---

### 5. Access from Other Devices

On any device on the same network:
- Open browser
- Go to: `http://YOUR_SERVER_IP:3000`
- Example: `http://192.168.56.1:3000`

---

### 6. Firewall Setup (Windows)

Run in PowerShell as Administrator:

```powershell
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## ✅ Checklist

- [ ] Server IP address found
- [ ] MySQL database created and imported
- [ ] `backend/.env` file created with correct IP
- [ ] `frontend/.env` file created with correct IP
- [ ] Dependencies installed (`npm install` in both folders)
- [ ] Firewall rules added
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Can access from other devices

---

## 🐛 Common Issues

**"Cannot connect"**
- Check firewall settings
- Verify IP address is correct
- Ensure both servers are running

**"Database error"**
- Check MySQL is running
- Verify database credentials in `.env`

**"CORS error"**
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

