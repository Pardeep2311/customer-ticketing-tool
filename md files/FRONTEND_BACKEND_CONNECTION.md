# Frontend-Backend Connection Guide

## ✅ Connection Complete!

The frontend and backend are now fully connected. Here's what has been set up:

## 🔌 API Configuration

### Backend API Base URL
- Default: `http://localhost:5000/api`
- Can be configured via environment variable: `REACT_APP_API_URL`

### Frontend Environment Setup
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 Files Created/Updated

### API Services
- ✅ `frontend/src/api/axios.js` - Axios configuration with interceptors
- ✅ `frontend/src/api/auth.js` - Authentication API calls
- ✅ `frontend/src/api/tickets.js` - Ticket API calls
- ✅ `frontend/src/api/dashboard.js` - Dashboard API calls

### Context & State Management
- ✅ `frontend/src/context/AuthContext.jsx` - Global authentication state

### Components
- ✅ `frontend/src/components/ProtectedRoute.jsx` - Route protection with role-based access

### Pages Updated
- ✅ `frontend/src/pages/Login.jsx` - Connected to backend login API
- ✅ `frontend/src/pages/Register.jsx` - Connected to backend register API
- ✅ `frontend/src/pages/CustomerDashboard.jsx` - New customer dashboard
- ✅ `frontend/src/pages/AdminDashboard.jsx` - New admin dashboard

### App Configuration
- ✅ `frontend/src/App.js` - Updated with AuthProvider and protected routes

## 🔐 Authentication Flow

1. **User logs in** → Frontend calls `POST /api/auth/login`
2. **Backend validates** → Returns JWT token and user data
3. **Frontend stores** → Token saved in localStorage
4. **Protected routes** → Token sent in Authorization header
5. **Backend verifies** → Middleware validates token on each request

## 🛣️ Route Structure

### Public Routes
- `/` → Redirects to `/login`
- `/login` → Login page
- `/register` → Registration page

### Protected Routes
- `/customer/dashboard` → Customer dashboard (customer role only)
- `/admin/dashboard` → Admin dashboard (admin role only)

## 🚀 How to Test

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Server should run on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm start
```
Frontend should run on `http://localhost:3000`

### 3. Test Registration
1. Go to `http://localhost:3000/register`
2. Fill in the form
3. Submit → Should create account and redirect to customer dashboard

### 4. Test Login
1. Go to `http://localhost:3000/login`
2. Enter credentials
3. Submit → Should login and redirect based on role

## 📡 API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (auto-called on app load)

### Dashboard
- `GET /api/dashboard/customer` - Customer dashboard stats
- `GET /api/dashboard/admin` - Admin dashboard stats

### Tickets
- `GET /api/tickets` - Get tickets (filtered by role)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (admin only)

## 🔒 Security Features

1. **JWT Tokens** - Secure token-based authentication
2. **Token Storage** - Stored in localStorage
3. **Auto Token Injection** - Axios interceptor adds token to requests
4. **Token Expiration** - Auto-logout on token expiry
5. **Role-Based Access** - Protected routes check user roles
6. **Route Guards** - Unauthenticated users redirected to login

## 🎯 Features Implemented

✅ User Registration
✅ User Login
✅ JWT Authentication
✅ Protected Routes
✅ Role-Based Access Control
✅ Customer Dashboard
✅ Admin Dashboard
✅ API Error Handling
✅ Auto Token Refresh Check
✅ Logout Functionality

## 🐛 Troubleshooting

### CORS Errors
- Make sure backend has `FRONTEND_URL=http://localhost:3000` in `.env`
- Check backend CORS configuration in `server.js`

### 401 Unauthorized
- Check if token is being sent in headers
- Verify JWT_SECRET matches in backend `.env`
- Token might be expired - try logging in again

### Connection Refused
- Ensure backend server is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Verify no firewall blocking the connection

### Database Connection Issues
- Check MySQL is running
- Verify database credentials in backend `.env`
- Ensure database `customer_ticketing_db` exists

## 📝 Next Steps

1. ✅ Backend and Frontend connected
2. ⏳ Create ticket creation page
3. ⏳ Create ticket detail/view page
4. ⏳ Add ticket comments functionality
5. ⏳ Implement file upload for attachments
6. ⏳ Add employee dashboard
7. ⏳ Add ticket assignment functionality

## 🎉 You're All Set!

The frontend and backend are now fully connected and ready to use. You can:
- Register new users
- Login with credentials
- Access role-based dashboards
- View dashboard statistics

Happy coding! 🚀

