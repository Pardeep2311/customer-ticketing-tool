# Assignment Groups and Subcategories - Purpose and Usage

## 📋 Overview

This document explains the purpose and implementation of **Assignment Groups** and **Subcategories** in the ticketing system.

---

## 🎯 Assignment Groups

### Purpose
**Assignment Groups** are teams or departments that handle specific types of tickets. They help route tickets to the right team before assigning to an individual.

### Real-World Example:
```
Customer reports: "My laptop won't turn on"
↓
Ticket is assigned to: "Hardware Team" (Assignment Group)
↓
Later, a team member picks it up: "Assigned to: John Doe" (Individual)
```

### Benefits:
1. **Better Organization**: Tickets go to the right team automatically
2. **Workload Distribution**: Any team member can pick up tickets from their group
3. **Reporting**: Track which teams handle which types of issues
4. **Escalation**: Easy to escalate within or between groups

### Sample Assignment Groups:
- **IT Support Team** - General IT issues
- **Hardware Team** - Laptops, desktops, printers
- **Network Team** - Network connectivity issues
- **Software Team** - Software installation and apps
- **Help Desk** - First-line support

### How It Works:
1. Admin creates assignment groups
2. Admin adds users to groups (members or leads)
3. When creating/updating a ticket, admin selects an assignment group
4. Any member of that group can see and work on the ticket
5. Later, ticket can be assigned to a specific person within the group

---

## 🏷️ Subcategories

### Purpose
**Subcategories** provide more specific classification under main categories. They help with:
- Better ticket routing
- More accurate reporting
- Knowledge base matching
- SLA management

### Real-World Example:
```
Category: "Technical Support"
↓
Subcategory: "Laptop Issues" or "Network Connectivity" or "Printer Issues"
```

### Sample Subcategories:

**Under "Technical Support":**
- Laptop Issues
- Desktop Issues
- Printer Issues
- Network Connectivity
- Email Issues

**Under "Account Issues":**
- Password Reset
- Account Locked

**Under "Bug Report":**
- Application Bug
- System Bug

**Under "Billing":**
- Payment Issue
- Invoice Query

### How It Works:
1. Admin creates subcategories under each category
2. When creating a ticket, user selects:
   - Category (required)
   - Subcategory (optional, but recommended)
3. System uses subcategory for better routing and reporting

---

## 🔄 Workflow Example

### Scenario: Customer reports laptop issue

1. **Customer creates ticket:**
   - Category: "Technical Support"
   - Subcategory: "Laptop Issues"
   - Short Description: "Laptop won't turn on"

2. **System/Auto-assignment (optional):**
   - Based on subcategory "Laptop Issues", system suggests:
   - Assignment Group: "Hardware Team"

3. **Admin/Agent assigns:**
   - Assignment Group: "Hardware Team" ✅
   - Assigned to: (Empty - any team member can pick it up)

4. **Team member picks up:**
   - Assigned to: "John Doe" (Hardware Team member) ✅

5. **Result:**
   - Ticket is properly categorized
   - Right team is handling it
   - Specific person is responsible

---

## 📊 Database Structure

### Assignment Groups Table:
- `id` - Primary key
- `name` - Group name (e.g., "Hardware Team")
- `description` - What this group handles
- `email` - Group email for notifications
- `is_active` - Whether group is active

### Assignment Group Members Table:
- `group_id` - Which group
- `user_id` - Which user
- `role` - "member" or "lead" (lead can assign tickets)

### Subcategories Table:
- `id` - Primary key
- `category_id` - Parent category
- `name` - Subcategory name
- `description` - What this subcategory covers

### Tickets Table (Updated):
- `assignment_group_id` - Which group is handling
- `subcategory_id` - More specific category
- `assigned_to` - Specific person (can be empty if only group assigned)

---

## 🚀 Implementation Plan

### Step 1: Database Setup ✅
- Run `add_assignment_groups_and_subcategories.sql`
- Creates tables and sample data

### Step 2: Backend API
- Create endpoints for:
  - GET `/api/assignment-groups` - List all groups
  - GET `/api/assignment-groups/:id/members` - Get group members
  - GET `/api/subcategories` - List subcategories by category
  - POST `/api/tickets` - Update to accept assignment_group_id and subcategory_id

### Step 3: Frontend Integration
- Update CreateTicket form:
  - Assignment Group dropdown (with search)
  - Subcategory dropdown (filtered by selected category)
  - Show group members when group is selected

### Step 4: Dashboard Updates
- Filter tickets by assignment group
- Show assignment group in ticket list
- Allow assigning to group or individual

---

## 💡 Best Practices

1. **Assignment Groups:**
   - Create groups based on your actual teams
   - Add all relevant team members
   - Use descriptive names

2. **Subcategories:**
   - Create 3-5 subcategories per category
   - Make them specific but not too granular
   - Use for routing and reporting

3. **Workflow:**
   - Assign to group first (for routing)
   - Then assign to individual (for ownership)
   - Update group/individual as ticket progresses

---

## ❓ FAQ

**Q: Can a ticket be assigned to both a group and an individual?**
A: Yes! Group for routing, individual for ownership.

**Q: What if I don't use assignment groups?**
A: You can leave it empty and just assign to individuals.

**Q: Can a user be in multiple groups?**
A: Yes! A user can be a member of multiple groups.

**Q: Are subcategories required?**
A: No, but they're recommended for better organization.

---

## 📝 Next Steps

After reviewing this document, we'll:
1. ✅ Create database tables (DONE)
2. Create backend API endpoints
3. Update frontend forms
4. Add filtering and reporting features

