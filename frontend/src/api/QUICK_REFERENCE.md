# 🚀 API Functions - Quick Reference

## 📋 All Available Functions

### 🔐 Authentication (`auth.js`)

```javascript
import { login, register, getCurrentUser, logout } from '../api/auth';

// Login
const result = await login({ email: '...', password: '...' });

// Register
const result = await register({ name: '...', email: '...', password: '...' });

// Get current user
const user = await getCurrentUser();

// Logout (clears localStorage)
logout();
```

---

### 🎫 Tickets (`tickets.js`)

```javascript
import { 
  createTicket, 
  getTickets, 
  getTicket, 
  updateTicket, 
  deleteTicket 
} from '../api/tickets';

// Create ticket
const ticket = await createTicket({
  subject: 'Help needed',
  description: 'My issue...',
  category_id: 1,
  priority: 'high'
});

// Get all tickets (with filters)
const tickets = await getTickets({
  status: 'open',
  priority: 'high',
  category_id: 1,
  page: 1,
  limit: 10
});

// Get single ticket
const ticket = await getTicket(123);

// Update ticket
const updated = await updateTicket(123, {
  status: 'resolved',
  priority: 'low'
});

// Delete ticket
await deleteTicket(123);
```

---

### 📊 Dashboard (`dashboard.js`)

```javascript
import { getCustomerDashboard, getAdminDashboard } from '../api/dashboard';

// Customer dashboard
const stats = await getCustomerDashboard();
// Returns: { total, byStatus, byPriority, recentTickets }

// Admin dashboard
const stats = await getAdminDashboard();
// Returns: { total, byStatus, byPriority, byCategory, unassigned, userStats, recentTickets }
```

---

### 💬 Comments (`comments.js`)

```javascript
import { 
  addComment, 
  getComments, 
  updateComment, 
  deleteComment 
} from '../api/comments';

// Add comment
const comment = await addComment(123, {
  comment: 'This is my comment',
  is_internal: false  // true for staff-only notes
});

// Get comments
const comments = await getComments(123);

// Update comment
const updated = await updateComment(123, 456, {
  comment: 'Updated comment'
});

// Delete comment
await deleteComment(123, 456);
```

---

## 🔄 Response Format

All API functions return data in this format:

```javascript
{
  success: true,           // or false
  message: "Success message",
  data: { ... }           // The actual data
}
```

**Example:**
```javascript
const response = await login({ email: '...', password: '...' });

if (response.success) {
  const { user, token } = response.data;
  // Use user and token
} else {
  // Handle error
  console.error(response.message);
}
```

---

## ⚠️ Error Handling

Always wrap API calls in try/catch:

```javascript
try {
  const result = await createTicket(ticketData);
  if (result.success) {
    // Success!
  }
} catch (error) {
  // Handle error
  console.error('Failed:', error);
  toast.error('Failed to create ticket');
}
```

---

## 🔑 Authentication

All functions (except login/register) automatically include your auth token. The token is stored in `localStorage` and added automatically by `axios.js`.

If you get a 401 error, you're not logged in or your token expired.

---

## 📝 Notes

- All functions are `async` - use `await` when calling them
- All functions return a Promise
- Check `response.success` before using `response.data`
- Use try/catch for error handling

