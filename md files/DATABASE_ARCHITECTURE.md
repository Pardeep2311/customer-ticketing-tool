# Database Architecture Overview

## Database Choice: MySQL

**Why MySQL?**
- Already configured in your project (mysql2 package)
- Reliable and widely used
- Good for relational data (tickets, users, comments)
- Easy to set up and manage
- Free and open-source

## Database Schema Diagram

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │
│ name        │
│ email (UK)  │
│ password    │
│ role        │──┐
│ phone       │  │
│ company     │  │
│ is_active   │  │
└─────────────┘  │
                 │
                 │ 1:N
                 │
┌─────────────┐  │  ┌──────────────┐
│   tickets   │◄─┘  │  categories  │
├─────────────┤     ├──────────────┤
│ id (PK)     │     │ id (PK)      │
│ ticket_num  │     │ name         │
│ customer_id │◄────┤ description  │
│ assigned_to │     └──────────────┘
│ category_id │◄────┐
│ subject     │     │
│ description │     │
│ priority    │     │
│ status      │     │
└─────────────┘     │
      │             │
      │ 1:N         │ 1:N
      │             │
      ▼             ▼
┌─────────────┐  ┌──────────────┐
│  comments   │  │ attachments  │
├─────────────┤  ├──────────────┤
│ id (PK)     │  │ id (PK)      │
│ ticket_id   │  │ ticket_id    │
│ user_id     │  │ user_id      │
│ comment     │  │ file_name    │
│ is_internal │  │ file_path    │
└─────────────┘  └──────────────┘
      │
      │ 1:N
      │
      ▼
┌─────────────┐
│   history   │
├─────────────┤
│ id (PK)     │
│ ticket_id   │
│ user_id     │
│ action      │
│ old_value   │
│ new_value   │
└─────────────┘
```

## User Roles

### 1. Admin
- Full system access
- Manage all tickets
- Manage users (create, edit, delete)
- Manage categories
- View all statistics
- Assign tickets to employees

### 2. Customer
- Create tickets
- View own tickets only
- Add comments to own tickets
- Upload attachments
- View ticket status

### 3. Employee
- View assigned tickets
- Update ticket status
- Add comments (internal/public)
- Resolve tickets
- View dashboard stats

## Ticket Workflow

```
Customer Creates Ticket
        ↓
    Status: OPEN
        ↓
Admin/Employee Assigns
        ↓
    Status: IN_PROGRESS
        ↓
Employee Works on Ticket
        ↓
    Status: RESOLVED
        ↓
Customer Confirms
        ↓
    Status: CLOSED
```

## Priority Levels

- **Low**: General inquiries, non-urgent
- **Medium**: Standard support requests
- **High**: Important issues needing attention
- **Urgent**: Critical issues requiring immediate action

## Status Flow

1. **OPEN** - New ticket created
2. **IN_PROGRESS** - Assigned and being worked on
3. **RESOLVED** - Issue fixed, waiting for customer confirmation
4. **CLOSED** - Customer confirmed resolution
5. **CANCELLED** - Ticket cancelled (by customer or admin)

## Dashboard Data Requirements

### Customer Dashboard:
- Total tickets created
- Open tickets count
- In progress tickets
- Resolved tickets
- Recent tickets list
- Average response time

### Admin Dashboard:
- Total tickets (all statuses)
- Tickets by status (pie chart)
- Tickets by priority (bar chart)
- Tickets by category
- Tickets by employee (assignment)
- Recent activity
- User statistics
- Response time metrics
- Resolution rate

## Sample Data Structure

### Example Ticket:
```json
{
  "id": 1,
  "ticket_number": "TKT-2024-001",
  "customer_id": 5,
  "assigned_to": 2,
  "category_id": 1,
  "subject": "Login issue",
  "description": "Cannot login to my account",
  "priority": "high",
  "status": "in_progress",
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 14:20:00"
}
```

## Indexes for Performance

- `users.email` - Fast login lookup
- `users.role` - Filter by role
- `tickets.customer_id` - Customer's tickets
- `tickets.assigned_to` - Employee's tickets
- `tickets.status` - Filter by status
- `tickets.priority` - Filter by priority
- `tickets.ticket_number` - Quick ticket lookup

## Next Steps

1. ✅ Database schema created
2. ⏳ Set up database connection
3. ⏳ Create API endpoints
4. ⏳ Implement authentication
5. ⏳ Build ticket management
6. ⏳ Create dashboard APIs
7. ⏳ Add file upload
8. ⏳ Testing

