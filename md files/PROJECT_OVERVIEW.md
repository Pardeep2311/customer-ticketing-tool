# Customer Ticketing Tool - Project Overview

## 📋 Project Summary

A comprehensive **ServiceNow-style Incident/Help-Desk Ticketing System** built with React.js frontend and Node.js/Express backend, featuring role-based access control for Customers, Employees, and Admins.

---

## 🏗️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation and routing
- **Tailwind CSS v3** - Styling (dark theme)
- **Axios** - HTTP client for API calls
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **CRACO** - Webpack configuration override for Create React App

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2/promise** - MySQL driver with Promise support
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL** - Relational database
- Tables: `users`, `tickets`, `categories`, `ticket_comments`, `ticket_attachments`, `ticket_history`

---

## 📁 Project Structure

```
Customer_Ticketing_Tool/
├── frontend/
│   ├── src/
│   │   ├── api/              # API service functions
│   │   │   ├── axios.js      # Axios instance with auth
│   │   │   ├── auth.js       # Authentication API
│   │   │   ├── tickets.js    # Tickets API
│   │   │   ├── dashboard.js  # Dashboard API
│   │   │   └── comments.js   # Comments API
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components
│   │   │   │   ├── button.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── label.jsx
│   │   │   │   └── checkbox.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   └── NotFound.jsx
│   │   ├── images/
│   │   │   └── logo.png
│   │   ├── App.js            # Main app with routes
│   │   └── index.js          # Entry point
│   ├── package.json
│   └── craco.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js         # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── ticketController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── categoryController.js
│   │   │   ├── commentController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── ticketRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   └── userRoutes.js
│   │   └── utils/
│   │       ├── response.js
│   │       └── generateTicketNumber.js
│   ├── database/
│   │   ├── schema.sql        # Database schema
│   │   ├── create_admin_user.sql
│   │   ├── fix_password_column.sql
│   │   └── check_password_column.sql
│   ├── scripts/
│   │   └── createAdmin.js    # Admin user creation script
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env                  # Environment variables
│
└── Documentation/
    ├── PROJECT_OVERVIEW.md
    ├── ADMIN_LOGIN_GUIDE.md
    └── README.md (if exists)
```

---

## 🗄️ Database Schema

### Tables

1. **users**
   - `id`, `name`, `email`, `password`, `role` (admin/customer/employee)
   - `is_active`, `created_at`, `updated_at`

2. **categories**
   - `id`, `name`, `description`, `created_at`

3. **tickets**
   - `id`, `ticket_number`, `customer_id`, `assigned_to`
   - `category_id`, `subject`, `description`
   - `priority` (low/medium/high/urgent)
   - `status` (open/in_progress/resolved/closed/cancelled)
   - `resolution`, `created_at`, `updated_at`, `resolved_at`

4. **ticket_comments**
   - `id`, `ticket_id`, `user_id`, `comment`
   - `is_internal` (for staff-only notes)
   - `created_at`, `updated_at`

5. **ticket_attachments**
   - `id`, `ticket_id`, `user_id`
   - `file_name`, `file_path`, `file_size`, `file_type`
   - `created_at`

6. **ticket_history**
   - `id`, `ticket_id`, `user_id`, `action`
   - `old_value`, `new_value`, `created_at`

---

## 🔐 Authentication & Authorization

### User Roles
- **Customer** - Can create tickets, view own tickets, add comments
- **Employee** - Can view assigned tickets, update status, add internal notes
- **Admin** - Full access to all tickets, users, categories, and system management

### Authentication Flow
1. User registers/logs in
2. Backend validates credentials
3. JWT token generated and returned
4. Token stored in localStorage (frontend)
5. Token sent in Authorization header for protected routes
6. Middleware validates token on each request

### Protected Routes
- `/customer/dashboard` - Customer only
- `/admin/dashboard` - Admin only
- `/tickets/create` - All authenticated users
- `/tickets/:id` - Ticket owner or staff

---

## 🎨 Frontend Pages & Features

### 1. **Login Page** (`/login`)
- Email and password authentication
- "Remember me" checkbox
- Forgot password link (UI only)
- Redirects to appropriate dashboard based on role

### 2. **Register Page** (`/register`)
- Name, email, password, confirm password
- Terms and conditions checkbox
- Auto-login after registration
- Redirects to customer dashboard

### 3. **Customer Dashboard** (`/customer/dashboard`)
- **Statistics Cards:**
  - Total tickets
  - Open tickets
  - In progress tickets
  - Resolved tickets

- **Features:**
  - Search tickets (by subject, description, ticket number)
  - Advanced filters (Status, Priority, Category)
  - Pagination
  - Click ticket to view details
  - Create new ticket button
  - Real-time ticket list

### 4. **Admin Dashboard** (`/admin/dashboard`)
- **Statistics Cards:**
  - Total tickets
  - Open tickets
  - In progress tickets
  - Unassigned tickets
  - User statistics (Customers, Employees, Admins)

- **Features:**
  - View all tickets
  - Quick assign tickets to employees
  - Advanced filters (Status, Priority, Assigned To)
  - Search functionality
  - Pagination
  - Click ticket to view/manage

### 5. **Create Ticket Page** (`/tickets/create`)
- Subject (required)
- Description (required)
- Category selection (optional)
- Priority selection (Low/Medium/High/Urgent)
- Form validation
- Success notification with ticket number

### 6. **Ticket Detail Page** (`/tickets/:id`)
- **Ticket Information:**
  - Full ticket details
  - Status and priority badges
  - Customer information
  - Assigned employee (if any)
  - Category
  - Created/updated dates
  - Resolution (if resolved)

- **Comments Section:**
  - View all comments
  - Add new comments
  - Internal notes (staff only)
  - User name and role display
  - Timestamps

- **Admin/Employee Features:**
  - Update ticket status
  - Change priority
  - Assign to employee
  - Add resolution

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new customer
- `POST /login` - Login user
- `GET /me` - Get current user (protected)

### Tickets (`/api/tickets`)
- `POST /` - Create new ticket (protected)
- `GET /` - Get tickets with filters (protected)
  - Query params: `status`, `priority`, `category_id`, `assigned_to`, `page`, `limit`, `unassigned`
- `GET /:id` - Get single ticket (protected)
- `PUT /:id` - Update ticket (protected)
- `DELETE /:id` - Delete ticket (admin only)

### Dashboard (`/api/dashboard`)
- `GET /customer` - Customer dashboard stats (customer only)
- `GET /admin` - Admin dashboard stats (admin only)

### Categories (`/api/categories`)
- `GET /` - Get all categories (public)
- `GET /:id` - Get single category (public)
- `POST /` - Create category (admin only)
- `PUT /:id` - Update category (admin only)
- `DELETE /:id` - Delete category (admin only)

### Comments (`/api/tickets/:ticketId/comments`)
- `POST /` - Add comment (protected)
- `GET /` - Get comments (protected)
- `PUT /:commentId` - Update comment (protected)
- `DELETE /:commentId` - Delete comment (protected)

### Users (`/api/users`)
- `GET /` - Get users (filtered by role) (protected)
  - Query param: `role` (e.g., `role=employee,admin`)
- `GET /:id` - Get single user (protected)

---

## ✨ Key Features Implemented

### ✅ Core Features
- [x] User registration and authentication
- [x] Role-based access control (Customer, Employee, Admin)
- [x] Ticket creation with categories and priorities
- [x] Ticket viewing and management
- [x] Comment system with internal notes
- [x] Ticket assignment (Admin/Employee)
- [x] Status management (Open, In Progress, Resolved, Closed)
- [x] Priority management (Low, Medium, High, Urgent)
- [x] Search functionality
- [x] Advanced filtering
- [x] Pagination
- [x] Real-time updates
- [x] Responsive design (mobile-friendly)
- [x] Dark theme UI

### 📊 Dashboard Features
- [x] Statistics cards
- [x] Ticket lists with filters
- [x] Quick actions (assign, update)
- [x] User statistics
- [x] Recent tickets display

### 🔒 Security Features
- [x] Password hashing (bcrypt)
- [x] JWT token authentication
- [x] Protected routes
- [x] Role-based authorization
- [x] Input validation
- [x] SQL injection prevention (parameterized queries)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=  # Leave empty if no password
   DB_NAME=customer_ticketing_db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Create database:**
   ```sql
   CREATE DATABASE customer_ticketing_db;
   ```

5. **Run schema:**
   ```bash
   mysql -u root -p customer_ticketing_db < database/schema.sql
   ```

6. **Create admin user:**
   ```bash
   node scripts/createAdmin.js
   ```

7. **Start server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Access application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

---

## 👥 User Flows

### Customer Flow
1. Register account → Auto-login
2. View dashboard → See ticket statistics
3. Create ticket → Fill form → Submit
4. View ticket → See details and comments
5. Add comment → Update ticket
6. Track ticket status → See updates

### Admin Flow
1. Login with admin credentials
2. View admin dashboard → See all tickets
3. Filter/search tickets → Find specific tickets
4. Assign tickets → Select employee
5. Update ticket status → Change to resolved/closed
6. Add comments → Internal notes visible to staff
7. View statistics → Monitor system health

---

## 📝 Default Data

### Categories (Pre-loaded)
- Technical Support
- Billing
- Feature Request
- Bug Report
- General Inquiry
- Account Issues

### Admin User (After running script)
- Email: `admin@cantik.com`
- Password: `admin123`

---

## 🔧 Configuration Files

### Backend
- `server.js` - Express server configuration
- `.env` - Environment variables
- `package.json` - Dependencies and scripts

### Frontend
- `craco.config.js` - CRACO configuration for Tailwind
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

---

## 🐛 Known Issues & Solutions

### Database Connection Issues
- **Problem:** "Access denied for user 'root'@'localhost'"
- **Solution:** Check `.env` file, ensure `DB_PASSWORD` is correct (or empty if no password)

### Password Not Saving
- **Problem:** Password not being saved during registration
- **Solution:** Ensure `password` column exists and is `NOT NULL` in database

### Styling Not Working
- **Problem:** Tailwind CSS classes not applying
- **Solution:** Ensure CRACO is configured correctly, restart dev server

---

## 📈 Future Enhancements (Not Implemented)

- [ ] File attachments upload
- [ ] Email notifications
- [ ] Real-time updates (WebSocket)
- [ ] Ticket history timeline
- [ ] SLA tracking
- [ ] Reports and analytics charts
- [ ] Export tickets to CSV/PDF
- [ ] Bulk ticket operations
- [ ] Ticket templates
- [ ] Knowledge base integration

---

## 📞 Support & Documentation

- **Admin Login Guide:** `ADMIN_LOGIN_GUIDE.md`
- **Database Schema:** `backend/database/schema.sql`
- **API Documentation:** See API Endpoints section above

---

## 🎯 Project Status

**Status:** ✅ **Fully Functional**

All core features are implemented and working:
- Authentication ✅
- Ticket Management ✅
- Dashboard Views ✅
- Comments System ✅
- Role-Based Access ✅
- Search & Filters ✅

The system is ready for use and can be extended with additional features as needed.

---

## 📄 License

This project is for educational/demonstration purposes.

---

**Last Updated:** December 2024
**Version:** 1.0.0

