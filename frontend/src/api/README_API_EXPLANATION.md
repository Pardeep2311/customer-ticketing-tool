# 📚 API Folder - Beginner's Guide

## 🤔 What is an API?

**API** stands for **Application Programming Interface**. Think of it as a **waiter in a restaurant**:

- **You (Frontend)** = Customer
- **API** = Waiter
- **Backend Server** = Kitchen

When you want food (data), you tell the waiter (API), the waiter goes to the kitchen (backend), and brings back your food (data).

---

## 📁 What Does This `api` Folder Do?

This folder contains **functions that talk to your backend server**. It's like having a phone book with all the phone numbers (endpoints) you need to call.

### Simple Analogy:
- **Frontend (React)** = Your phone
- **API folder** = Your contact list
- **Backend** = The person you're calling
- **Functions** = The buttons you press to make calls

---

## 📂 Files in This Folder

### 1. `axios.js` - The Phone Setup ⚙️

This is like **setting up your phone** with default settings.

```javascript
// This creates a "phone" (axios instance) with default settings
const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // Always call this number first
  headers: {
    'Content-Type': 'application/json',    // Speak in JSON language
  },
});
```

**What it does:**
- ✅ Sets the base URL (where your backend lives)
- ✅ Automatically adds your login token to every request
- ✅ Handles errors (like if you're logged out)

**Think of it as:** Your phone automatically adding your caller ID and handling busy signals.

---

### 2. `auth.js` - Login/Register Functions 🔐

This file handles **user authentication** (login, register, logout).

```javascript
// Example: Login function
export const login = async (credentials) => {
  // credentials = { email: "user@example.com", password: "123456" }
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
```

**What it does:**
- `login()` - Sends email/password to backend, gets back user info + token
- `register()` - Creates new user account
- `getCurrentUser()` - Gets info about logged-in user
- `logout()` - Clears saved login info

**How to use it:**
```javascript
// In your React component:
import { login } from '../api/auth';

const handleLogin = async () => {
  const result = await login({
    email: 'user@example.com',
    password: 'password123'
  });
  // result = { success: true, data: { user: {...}, token: "..." } }
};
```

---

### 3. `tickets.js` - Ticket Operations 🎫

This file handles **all ticket-related operations**.

```javascript
// Create a new ticket
export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

// Get all tickets
export const getTickets = async (filters = {}) => {
  const response = await api.get('/tickets', { params: filters });
  return response.data;
};
```

**What it does:**
- `createTicket()` - Creates a new ticket
- `getTickets()` - Gets list of tickets (with optional filters)
- `getTicket(id)` - Gets one specific ticket
- `updateTicket(id, data)` - Updates a ticket
- `deleteTicket(id)` - Deletes a ticket

**How to use it:**
```javascript
import { createTicket, getTickets } from '../api/tickets';

// Create ticket
const newTicket = await createTicket({
  subject: 'My computer is broken',
  description: 'It won't turn on',
  priority: 'high'
});

// Get tickets with filters
const tickets = await getTickets({
  status: 'open',
  priority: 'high',
  page: 1
});
```

---

### 4. `dashboard.js` - Dashboard Data 📊

This file gets **statistics and data for dashboards**.

```javascript
// Get customer dashboard stats
export const getCustomerDashboard = async () => {
  const response = await api.get('/dashboard/customer');
  return response.data;
};
```

**What it does:**
- `getCustomerDashboard()` - Gets stats for customer (their tickets count, etc.)
- `getAdminDashboard()` - Gets stats for admin (all tickets, users, etc.)

**How to use it:**
```javascript
import { getCustomerDashboard } from '../api/dashboard';

const stats = await getCustomerDashboard();
// stats = { total: 10, byStatus: { open: 5, resolved: 5 }, ... }
```

---

### 5. `comments.js` - Comment Operations 💬

This file handles **comments on tickets**.

```javascript
// Add a comment
export const addComment = async (ticketId, commentData) => {
  const response = await api.post(`/tickets/${ticketId}/comments`, commentData);
  return response.data;
};
```

**What it does:**
- `addComment()` - Adds a comment to a ticket
- `getComments()` - Gets all comments for a ticket
- `updateComment()` - Updates a comment
- `deleteComment()` - Deletes a comment

**How to use it:**
```javascript
import { addComment } from '../api/comments';

await addComment(123, {
  comment: 'This is my comment',
  is_internal: false
});
```

---

## 🔄 How It All Works Together

### Step-by-Step Example: Creating a Ticket

1. **User clicks "Create Ticket" button** in React component
2. **Component calls** `createTicket()` from `api/tickets.js`
3. **`createTicket()` uses** `api` from `axios.js` to send POST request
4. **`axios.js` automatically adds** authentication token
5. **Request goes to backend** at `http://localhost:5000/api/tickets`
6. **Backend processes** and saves to database
7. **Backend sends response** back
8. **`axios.js` receives response** and returns it
9. **`createTicket()` returns** the data
10. **Component receives** the data and updates UI

```
User Action → Component → API Function → Axios → Backend → Database
                                                              ↓
User Sees Result ← Component ← API Function ← Axios ← Backend ←
```

---

## 🎯 Key Concepts Explained

### 1. **async/await** - Waiting for Results

```javascript
// Without async/await (old way):
api.get('/tickets').then(response => {
  console.log(response.data);
});

// With async/await (modern way - easier to read):
const response = await api.get('/tickets');
console.log(response.data);
```

**Think of it as:** 
- Old way = "Call me when food is ready"
- New way = "Wait here until food is ready, then continue"

### 2. **export/import** - Sharing Functions

```javascript
// In auth.js - Export (share) the function
export const login = async (...) => { ... };

// In your component - Import (use) the function
import { login } from '../api/auth';
```

**Think of it as:** 
- Export = Publishing a recipe
- Import = Using someone else's recipe

### 3. **HTTP Methods** - Different Types of Requests

- **GET** = "Give me data" (like reading a book)
- **POST** = "Create something new" (like writing a new book)
- **PUT** = "Update something" (like editing a book)
- **DELETE** = "Remove something" (like throwing away a book)

### 4. **Request/Response** - Sending and Receiving

```javascript
// REQUEST (what you send)
await api.post('/tickets', {
  subject: 'Help needed',
  description: 'My issue...'
});

// RESPONSE (what you get back)
{
  success: true,
  data: {
    id: 123,
    ticket_number: 'TKT-001',
    ...
  }
}
```

---

## 💡 Real-World Example

Let's trace through a **complete login flow**:

### 1. User enters email and password, clicks "Login"

### 2. Component code:
```javascript
import { login } from '../api/auth';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Call the API function
  const response = await login({
    email: formData.email,
    password: formData.password
  });
  
  // Handle the response
  if (response.success) {
    // Save token and user info
    localStorage.setItem('token', response.data.token);
    // Redirect to dashboard
    navigate('/dashboard');
  }
};
```

### 3. `auth.js` function:
```javascript
export const login = async (credentials) => {
  // Uses the configured axios instance
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
```

### 4. `axios.js` intercepts and adds token:
```javascript
// Automatically adds: Authorization: Bearer <token>
// (if token exists in localStorage)
```

### 5. Request sent to: `http://localhost:5000/api/auth/login`

### 6. Backend processes and responds:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "John", "email": "..." },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 7. Response flows back through the chain

### 8. Component receives data and updates UI

---

## 🛠️ How to Add a New API Function

### Example: Adding a "Get User Profile" function

**Step 1:** Open `auth.js` (or create new file)

**Step 2:** Add the function:
```javascript
// Get user profile
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
```

**Step 3:** Use it in your component:
```javascript
import { getUserProfile } from '../api/auth';

const profile = await getUserProfile(123);
```

---

## 🎓 Practice Exercises

### Exercise 1: Understanding the Flow
1. Find where `login()` is called in your codebase
2. Trace the flow from component → api → axios → backend
3. Draw a diagram showing the flow

### Exercise 2: Adding a Function
1. Add a new function to `tickets.js` called `getTicketHistory(id)`
2. It should call `GET /tickets/:id/history`
3. Use it in a component

### Exercise 3: Error Handling
1. Look at how errors are handled in `axios.js`
2. Add try/catch to an API call in a component
3. Show error message to user

---

## ❓ Common Questions

### Q: Why separate files for different features?
**A:** Organization! It's easier to find and maintain code when it's organized by feature.

### Q: Why use `axios.js` instead of calling axios directly?
**A:** So we can add default settings (like base URL and authentication) once, and use them everywhere.

### Q: What if the backend is down?
**A:** The `axios.js` error handler will catch it and you can show an error message to the user.

### Q: Can I call the backend directly without these functions?
**A:** Yes, but it's not recommended. These functions make your code cleaner and easier to maintain.

---

## 📖 Summary

The `api` folder is your **communication layer** between frontend and backend:

1. **`axios.js`** = Your phone setup (base configuration)
2. **`auth.js`** = Login/register functions
3. **`tickets.js`** = Ticket operations
4. **`dashboard.js`** = Dashboard data
5. **`comments.js`** = Comment operations

**Pattern:**
- Each file = One feature area
- Each function = One API endpoint
- All functions use the same `api` instance from `axios.js`

**Remember:** 
- Frontend (React) → API Functions → Axios → Backend → Database
- The API folder is the bridge between your UI and your server!

---

## 🚀 Next Steps

1. ✅ Understand each file's purpose
2. ✅ See how functions are used in components
3. ✅ Try adding a new API function
4. ✅ Practice error handling
5. ✅ Learn about API response formats

Happy coding! 🎉

