# Testing Notes Functionality - Test Guide

## ✅ What We've Implemented

1. **Additional Comments (Customer Visible)**
   - When creating a ticket, if you fill "Additional comments", it creates a **public comment** (`is_internal = 0`)
   - This comment is visible to both customers and admins/employees
   - A history entry is added: `comment_added` with JSON `{ type: 'customer_comment', text: '...' }`

2. **Work Notes (Internal)**
   - When creating a ticket as admin/employee, if you fill "Work notes", it creates an **internal comment** (`is_internal = 1`)
   - This comment is **only visible to admins/employees** (customers cannot see it)
   - A history entry is added: `work_note_added` with JSON `{ type: 'work_note', text: '...' }`

3. **Caller Assignment**
   - When an admin/employee creates a ticket, they can select a **Caller** (requester)
   - The selected Caller becomes the `customer_id` of the ticket
   - The Caller is automatically added as a follower
   - The creator (admin/employee) is also added as a follower

4. **History Display**
   - `TicketDetail` page now shows formatted history entries for:
     - `comment_added` → "Added comment: '...'"
     - `work_note_added` → "Added work note: '...'"
     - `created` → "Ticket created: [subject]"
     - Status/Priority/Assignment changes → "Status: OPEN → IN_PROGRESS"

---

## 🧪 Test Scenarios

### Test 1: Create Ticket with Additional Comments (Customer)
**Steps:**
1. Login as a **customer**
2. Go to Create Ticket (`/tickets/create`)
3. Fill required fields:
   - Short description: "My laptop won't turn on"
   - Description: "The laptop shows no signs of power when I press the button"
   - Caller: (auto-filled with your user)
4. In **Additional comments** field, type: "This happened after a power outage"
5. Leave **Work notes** empty (customers can't use this)
6. Click **Submit**

**Expected Results:**
- ✅ Ticket is created successfully
- ✅ Go to Ticket Detail page
- ✅ In **Comments** section, you should see:
  - One comment with text: "This happened after a power outage"
  - Badge: (no "Internal" badge, since it's public)
  - User: Your name (customer)
- ✅ In **History** section, you should see:
  - "Ticket created: My laptop won't turn on"
  - "Added comment: 'This happened after a power outage'"

---

### Test 2: Create Ticket with Work Notes (Admin/Employee)
**Steps:**
1. Login as an **admin** or **employee**
2. Go to Create Ticket (`/tickets/create`)
3. Fill required fields:
   - Short description: "Customer reports WiFi issues"
   - Description: "Customer cannot connect to WiFi network"
   - Caller: Select a customer from the dropdown
4. In **Additional comments** field, type: "Customer mentioned router was reset"
5. In **Work notes** field, type: "Need to check router firmware version"
6. Click **Submit**

**Expected Results:**
- ✅ Ticket is created successfully
- ✅ Go to Ticket Detail page (as admin)
- ✅ In **Comments** section, you should see:
  - **Two comments**:
    1. "Customer mentioned router was reset" (public, no "Internal" badge)
    2. "Need to check router firmware version" (internal, has "Internal" badge)
- ✅ In **History** section, you should see:
  - "Ticket created: Customer reports WiFi issues"
  - "Added comment: 'Customer mentioned router was reset'"
  - "Added work note: 'Need to check router firmware version'"
- ✅ In **Ticket Details** sidebar:
  - Customer: Should show the selected Caller's name (not your admin name)
  - Followers: Should include both the Caller and you (admin)

---

### Test 3: Customer Viewing Ticket with Internal Work Notes
**Steps:**
1. After Test 2, **logout** and login as the **customer** who was selected as Caller
2. Go to the ticket detail page

**Expected Results:**
- ✅ In **Comments** section, you should see:
  - **Only ONE comment**: "Customer mentioned router was reset" (public)
  - **You should NOT see**: "Need to check router firmware version" (internal work note)
- ✅ In **History** section, you should see:
  - "Ticket created: Customer reports WiFi issues"
  - "Added comment: 'Customer mentioned router was reset'"
  - **You should NOT see**: "Added work note: ..." (internal notes are hidden from history too)

---

### Test 4: Add New Comment from Ticket Detail
**Steps:**
1. Go to any ticket detail page
2. Scroll to **Comments** section
3. Type a comment in the textarea
4. (If admin/employee) Check/uncheck "Internal note" checkbox
5. Click **Post Comment**

**Expected Results:**
- ✅ Comment appears immediately in the comments list
- ✅ If internal: Shows "Internal" badge (only for admins/employees)
- ✅ If public: No badge (visible to everyone)
- ✅ History entry is added (via commentController, not from createTicket)

---

## 🔍 Verification Checklist

- [ ] Additional comments from ticket creation appear in Comments section
- [ ] Work notes from ticket creation appear in Comments section (admin view only)
- [ ] Customers cannot see internal work notes
- [ ] History shows "Added comment: ..." for additional comments
- [ ] History shows "Added work note: ..." for work notes (admin view only)
- [ ] Caller assignment works when admin creates ticket
- [ ] Both Caller and Creator are added as followers
- [ ] New comments added from TicketDetail page work correctly
- [ ] Internal checkbox works for new comments (admin/employee only)

---

## 🐛 Known Issues / Notes

- **Work notes field** in CreateTicket is only visible/usable by admin/employee (this is intentional)
- **Customers** cannot create internal comments (this is intentional)
- History entries for comments/work notes show truncated text (first 80 characters) for readability

---

## 📝 Next Steps After Testing

If all tests pass, we can move to:
- **#2: Enhance TicketDetail page** (improve comments display, add more features)
- **#3: Ticket Management Features** (attachments, email notifications, etc.)

