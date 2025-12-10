# Backend Development Plan

## Overview
This document outlines the complete backend structure for the Customer Ticketing Tool with Admin and Customer dashboards.

## Database: MySQL
- **Database Name**: `customer_ticketing_db`
- **Tables**: users, tickets, categories, ticket_comments, ticket_attachments, ticket_history

## Backend Structure

### 1. Authentication System
**Endpoints:**
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login (all roles)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

**Features:**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Token expiration and refresh

### 2. User Management (Admin Only)
**Endpoints:**
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete/deactivate user
- `POST /api/users` - Create new user (admin/employee)
- `GET /api/users/stats` - User statistics

### 3. Ticket Management

#### Customer Endpoints:
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/my-tickets` - Get customer's own tickets
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update own ticket (limited fields)
- `POST /api/tickets/:id/comments` - Add comment to ticket
- `POST /api/tickets/:id/attachments` - Upload attachment

#### Admin/Employee Endpoints:
- `GET /api/tickets` - Get all tickets (with filters)
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket (full access)
- `PUT /api/tickets/:id/assign` - Assign ticket to employee
- `PUT /api/tickets/:id/status` - Change ticket status
- `PUT /api/tickets/:id/priority` - Change priority
- `DELETE /api/tickets/:id` - Delete ticket (admin only)
- `GET /api/tickets/stats` - Ticket statistics/dashboard data

### 4. Category Management (Admin Only)
**Endpoints:**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### 5. Dashboard Data

#### Customer Dashboard:
- `GET /api/dashboard/customer` - Customer dashboard stats
  - Total tickets
  - Open tickets
  - Resolved tickets
  - Recent tickets

#### Admin Dashboard:
- `GET /api/dashboard/admin` - Admin dashboard stats
  - Total tickets
  - Tickets by status
  - Tickets by priority
  - Tickets by category
  - Recent tickets
  - User statistics
  - Response time metrics

### 6. File Upload
**Endpoints:**
- `POST /api/upload` - Upload file
- `GET /api/upload/:filename` - Download file
- `DELETE /api/upload/:id` - Delete file

## Middleware

1. **authMiddleware.js** - Verify JWT token
2. **roleMiddleware.js** - Check user role (admin, customer, employee)
3. **errorHandler.js** - Global error handling
4. **validation.js** - Request validation

## Controllers Structure

```
src/
├── controllers/
│   ├── authController.js      - Authentication logic
│   ├── userController.js      - User management
│   ├── ticketController.js    - Ticket CRUD operations
│   ├── categoryController.js  - Category management
│   ├── commentController.js   - Comment management
│   ├── dashboardController.js - Dashboard data
│   └── uploadController.js    - File upload handling
```

## Routes Structure

```
src/
├── routes/
│   ├── authRoutes.js          - /api/auth/*
│   ├── userRoutes.js          - /api/users/*
│   ├── ticketRoutes.js        - /api/tickets/*
│   ├── categoryRoutes.js      - /api/categories/*
│   └── dashboardRoutes.js     - /api/dashboard/*
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Role-Based Access**: Middleware to restrict routes
4. **Input Validation**: Validate all user inputs
5. **SQL Injection Prevention**: Use parameterized queries
6. **CORS**: Configured for frontend domain
7. **Rate Limiting**: Prevent abuse (optional)

## Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=customer_ticketing_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=http://localhost:3000
```

## API Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

## Next Steps

1. Set up database connection
2. Create authentication system
3. Implement ticket CRUD operations
4. Add role-based middleware
5. Create dashboard endpoints
6. Add file upload functionality
7. Implement validation and error handling
8. Add logging and monitoring

