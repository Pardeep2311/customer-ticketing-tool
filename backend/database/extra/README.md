# Database Setup Guide

## Database: MySQL

This project uses MySQL as the database. The schema includes tables for:
- Users (Admin, Customer, Employee)
- Tickets
- Categories
- Comments/Replies
- Attachments
- History/Audit Log

## Setup Instructions

### 1. Install MySQL
Make sure MySQL is installed on your system.

### 2. Create Database
Run the schema file to create the database and tables:
```bash
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
mysql -u root -p
source database/schema.sql
```

### 3. Environment Variables
Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=customer_ticketing_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
PORT=5000
```

### 4. Database Connection
The backend will connect using the configuration in `src/config/db.js`

## Database Schema Overview

### Users Table
- Stores all users (admin, customer, employee)
- Roles: 'admin', 'customer', 'employee'
- Email must be unique

### Tickets Table
- Main ticket information
- Links to customer (creator) and assigned employee/admin
- Status: open, in_progress, resolved, closed, cancelled
- Priority: low, medium, high, urgent

### Categories Table
- Predefined ticket categories
- Can be managed by admin

### Ticket Comments
- Comments/replies on tickets
- Can be internal (staff only) or public

### Ticket Attachments
- File attachments for tickets
- Stores file metadata

### Ticket History
- Audit log of all ticket changes
- Tracks who did what and when

