# Application Diagnostics & Troubleshooting Guide

## Common Issues and Solutions

### 1. **Backend Not Running**
**Symptoms:**
- Frontend loads but API calls fail
- "Cannot connect to server" errors
- Network errors in browser console

**Solution:**
```bash
cd backend
npm install  # If dependencies not installed
npm start    # or npm run dev
```

**Check:**
- Backend should be running on port 5000
- Check console for "✅ Database connected successfully"
- Verify database credentials in `.env` file

---

### 2. **Database Connection Issues**
**Symptoms:**
- Backend starts but shows "❌ Database connection failed"
- API endpoints return 500 errors

**Solution:**
1. Create a `.env` file in the `backend` folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=customer_ticketing_db
PORT=5000
JWT_SECRET=your_secret_key_here
```

2. Ensure MySQL is running
3. Verify database exists:
```sql
CREATE DATABASE IF NOT EXISTS customer_ticketing_db;
```

---

### 3. **Frontend API Connection Issues**
**Symptoms:**
- Frontend can't reach backend
- CORS errors in console
- API calls timeout

**Current Configuration:**
- Frontend API URL is hardcoded to: `http://192.168.2.64:5000/api`
- This IP might have changed or backend might be on different IP

**Solution:**
1. **Option A: Use localhost (if running on same machine)**
   - Update `frontend/src/api/axios.js` line 9:
   ```javascript
   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
   ```

2. **Option B: Create `.env` file in `frontend` folder:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Or for network access:
   ```env
   REACT_APP_API_URL=http://192.168.2.64:5000/api
   ```

3. **Find your current IP address:**
   ```bash
   # Windows PowerShell
   ipconfig
   # Look for IPv4 Address under your active network adapter
   ```

---

### 4. **React 19 Compatibility Issues**
**Symptoms:**
- Console warnings about deprecated APIs
- Components not rendering
- Strange behavior

**Current Version:** React 19.2.0 (very new, may have compatibility issues)

**Solution:**
If experiencing issues, consider downgrading to React 18:
```bash
cd frontend
npm install react@^18.2.0 react-dom@^18.2.0
```

---

### 5. **Missing Dependencies**
**Symptoms:**
- Import errors
- "Module not found" errors
- Components not loading

**Solution:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

---

### 6. **CORS Errors**
**Symptoms:**
- Browser console shows CORS policy errors
- API requests blocked

**Current Setup:**
- Backend allows: `http://localhost:3000`, `http://127.0.0.1:3000`, `http://192.168.2.64:3000`

**Solution:**
If using a different URL, update `backend/server.js` line 13-18 to include your frontend URL.

---

### 7. **Port Conflicts**
**Symptoms:**
- "Port already in use" errors
- Server won't start

**Solution:**
- Frontend default: port 3000
- Backend default: port 5000

Change ports if needed:
- Frontend: Create `.env` file with `PORT=3001`
- Backend: Update `.env` file with `PORT=5001`

---

## Quick Diagnostic Checklist

### Backend Checklist:
- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Database is running (MySQL)
- [ ] `.env` file exists in `backend` folder with correct database credentials
- [ ] Database `customer_ticketing_db` exists
- [ ] No port conflicts (port 5000 available)
- [ ] Console shows "✅ Database connected successfully"

### Frontend Checklist:
- [ ] Frontend server is running (`npm start` in frontend folder)
- [ ] No console errors in browser
- [ ] API URL in `axios.js` matches backend URL
- [ ] CORS is configured correctly
- [ ] All dependencies installed (`npm install`)

### Network Checklist:
- [ ] Backend accessible at configured URL
- [ ] Test backend health: `http://localhost:5000/api/health`
- [ ] Frontend can reach backend (check Network tab in browser DevTools)
- [ ] Firewall not blocking ports 3000 or 5000

---

## Testing the Application

### 1. Test Backend:
```bash
cd backend
npm start
# Should see: "🚀 Server running on port 5000"
# Should see: "✅ Database connected successfully"
```

### 2. Test Backend API:
Open browser: `http://localhost:5000/api/health`
Should return: `{"success":true,"message":"Server is healthy",...}`

### 3. Test Frontend:
```bash
cd frontend
npm start
# Should open browser at http://localhost:3000
```

### 4. Test Connection:
- Open browser DevTools (F12)
- Go to Network tab
- Try to register/login
- Check if API calls are successful (status 200) or failing (status 0, 404, 500)

---

## Common Error Messages

### "Cannot connect to server"
- Backend not running
- Wrong API URL in frontend
- Firewall blocking connection

### "Database connection failed"
- MySQL not running
- Wrong database credentials
- Database doesn't exist

### "CORS policy error"
- Frontend URL not in backend CORS allowed origins
- Update `backend/server.js` CORS configuration

### "Module not found"
- Dependencies not installed
- Run `npm install` in appropriate folder

---

## Next Steps

1. **Check if backend is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Check if frontend is running:**
   ```bash
   cd frontend
   npm start
   ```

3. **Verify API connection:**
   - Open browser DevTools (F12)
   - Check Console and Network tabs for errors

4. **Update API URL if needed:**
   - Edit `frontend/src/api/axios.js`
   - Change line 9 to match your backend URL

5. **Check database connection:**
   - Ensure MySQL is running
   - Verify `.env` file in backend folder has correct credentials

---

## Getting Help

If issues persist:
1. Check browser console for specific error messages
2. Check backend console for error logs
3. Verify all services are running
4. Check network connectivity between frontend and backend

