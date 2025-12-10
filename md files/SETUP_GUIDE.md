# Backend Setup Guide

## ✅ Prerequisites

1. **MySQL Database** - Already created ✅
2. **Node.js** - Installed ✅
3. **Dependencies** - Already installed ✅

## 🚀 Quick Setup

### Step 1: Create `.env` file

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=customer_ticketing_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `your_mysql_password` with your actual MySQL password.

### Step 2: Start the Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Tickets
- `POST /api/tickets` - Create ticket (requires auth)
- `GET /api/tickets` - Get tickets (filtered by role)
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (admin only)

### Dashboard
- `GET /api/dashboard/customer` - Customer dashboard stats
- `GET /api/dashboard/admin` - Admin dashboard stats

## 🧪 Testing the API

### 1. Test Server Health
```bash
curl http://localhost:5000/api/health
```

### 2. Register a Customer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

### 4. Create a Ticket (use token from login)
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "subject": "Login Issue",
    "description": "I cannot login to my account",
    "priority": "high"
  }'
```

## 🔐 Default Admin User

To create an admin user, you can either:

1. **Directly in MySQL:**
```sql
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@cantik.com', '$2a$10$hashed_password_here', 'admin');
```

2. **Or use bcrypt to hash password first:**
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('admin123', 10);
console.log(hash); // Use this in SQL
```

## 📁 Project Structure

```
backend/
├── server.js                 # Main server file
├── .env                      # Environment variables (create this)
├── src/
│   ├── config/
│   │   └── db.js            # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── dashboardRoutes.js
│   └── utils/
│       ├── response.js
│       └── generateTicketNumber.js
└── database/
    └── schema.sql           # Database schema
```

## 🐛 Troubleshooting

### Database Connection Error
- Check MySQL is running: `mysql -u root -p`
- Verify `.env` file has correct credentials
- Ensure database `customer_ticketing_db` exists

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000

### JWT Errors
- Make sure `JWT_SECRET` is set in `.env`
- Token expires after 7 days (configurable)

## ✅ Next Steps

1. ✅ Database created
2. ✅ Backend code created
3. ⏳ Create `.env` file
4. ⏳ Start server
5. ⏳ Test API endpoints
6. ⏳ Connect frontend to backend

## 🔗 Frontend Integration

In your frontend, update API calls to use:
```javascript
const API_URL = 'http://localhost:5000/api';
```

Example login:
```javascript
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```
