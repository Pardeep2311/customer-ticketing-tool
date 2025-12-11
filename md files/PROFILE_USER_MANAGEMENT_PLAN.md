# Profile Section & User Management - Implementation Plan

## Overview
This document outlines the plan to implement:
1. **Profile Section** - Users can view and update their own profile
2. **User Management** - Admins can create, update, and manage user accounts

---

## Current State Analysis

### ✅ What Exists:
- **Backend:**
  - `GET /api/auth/me` - Get current user info
  - `GET /api/users` - Get all users (admin/employee)
  - `GET /api/users/:id` - Get single user
  - User table fields: `id`, `name`, `email`, `role`, `is_active`, `created_at`, `password`

- **Frontend:**
  - User info displayed in Sidebar (name, email, avatar)
  - Auth context with user data
  - API functions: `getCurrentUser()`, `getUsers()`, `getUser()`

### ❌ What's Missing:
- Profile page for users to edit their own info
- User management page for admins
- Backend endpoints for creating/updating/deleting users
- Password change functionality
- Profile picture upload (optional enhancement)

---

## Implementation Plan

### Phase 1: Backend Endpoints

#### 1.1 Update Own Profile (All Users)
**Endpoint:** `PUT /api/users/me`
- **Access:** Authenticated users (own profile only)
- **Fields:** `name`, `email`, `password` (optional)
- **Validation:**
  - Email must be unique (if changed)
  - Password must be at least 6 characters (if provided)
  - Name is required

#### 1.2 Create User (Admin Only)
**Endpoint:** `POST /api/users`
- **Access:** Admin only
- **Fields:** `name`, `email`, `password`, `role` (customer/employee/admin)
- **Validation:**
  - All fields required
  - Email must be unique
  - Role must be valid
  - Password must be at least 6 characters

#### 1.3 Update User (Admin Only)
**Endpoint:** `PUT /api/users/:id`
- **Access:** Admin only
- **Fields:** `name`, `email`, `role`, `is_active`, `password` (optional)
- **Validation:**
  - Email must be unique (if changed)
  - Cannot change own role to non-admin (if current user is admin)
  - Cannot deactivate own account

#### 1.4 Delete User (Admin Only)
**Endpoint:** `DELETE /api/users/:id`
- **Access:** Admin only
- **Validation:**
  - Cannot delete own account
  - Check for associated tickets before deletion (optional: soft delete)

---

### Phase 2: Frontend - Profile Page

#### 2.1 Profile Page Component (`Profile.jsx`)
**Location:** `frontend/src/pages/Profile.jsx`

**Features:**
- Display current user info (name, email, role, account created date)
- Edit form with fields:
  - Name (text input)
  - Email (text input)
  - Current Password (for verification when changing email/password)
  - New Password (optional, text input)
  - Confirm New Password (optional, text input)
- Change Password section (separate)
- Save button with loading state
- Success/error toast notifications
- Responsive design matching app theme

**UI Elements:**
- User avatar/initial circle
- Form with black borders (matching CreateTicket style)
- Gradient buttons (green for Save)
- White background

---

### Phase 3: Frontend - User Management Page

#### 3.1 User Management Page (`UserManagement.jsx`)
**Location:** `frontend/src/pages/UserManagement.jsx`

**Features:**
- **User List Table:**
  - Columns: Name, Email, Role, Status (Active/Inactive), Created Date, Actions
  - Search/filter by name, email, role
  - Pagination (if many users)
  
- **Create User Modal:**
  - Form: Name, Email, Password, Role (dropdown)
  - Validation and error handling
  
- **Edit User Modal:**
  - Pre-filled form with user data
  - Fields: Name, Email, Role, Status (Active/Inactive toggle)
  - Optional: Change Password section
  
- **Delete User Confirmation:**
  - Modal with warning message
  - Shows user's ticket count (if applicable)
  
- **Bulk Actions (Optional):**
  - Activate/Deactivate multiple users
  - Export user list to CSV

**UI Elements:**
- Table with hover effects
- Gradient buttons (green for Create, blue for Edit, red for Delete)
- Modals matching app design
- Search bar with filters

---

### Phase 4: API Functions

#### 4.1 Update `frontend/src/api/users.js`
Add functions:
- `updateProfile(userData)` - Update own profile
- `createUser(userData)` - Create new user (admin)
- `updateUser(userId, userData)` - Update user (admin)
- `deleteUser(userId)` - Delete user (admin)

#### 4.2 Update `frontend/src/api/auth.js` (if needed)
- Keep existing `getCurrentUser()` function

---

### Phase 5: Routing & Navigation

#### 5.1 Add Routes to `App.js`
```javascript
// Profile route (all authenticated users)
<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

// User Management route (admin only)
<Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
```

#### 5.2 Update Sidebar Navigation
- Add "Profile" link (all users) - link to `/profile`
- Add "User Management" link (admin only) - link to `/admin/users`
- Make user profile section in sidebar clickable to navigate to profile page

---

## Database Considerations

### Current User Table Structure:
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- role (ENUM: 'customer', 'employee', 'admin')
- is_active (BOOLEAN, default true)
- created_at (TIMESTAMP)
```

### Optional Enhancements (Future):
- `phone` (VARCHAR) - Phone number
- `avatar_url` (VARCHAR) - Profile picture URL
- `updated_at` (TIMESTAMP) - Last update timestamp
- `last_login` (TIMESTAMP) - Last login time
- `department` (VARCHAR) - For employees/admins

---

## Security Considerations

1. **Password Hashing:**
   - Always hash passwords using bcrypt before storing
   - Never return password in API responses

2. **Authorization:**
   - Users can only update their own profile
   - Only admins can create/update/delete other users
   - Admins cannot delete or deactivate themselves

3. **Email Uniqueness:**
   - Validate email uniqueness on create/update
   - Prevent email conflicts

4. **Input Validation:**
   - Sanitize all inputs
   - Validate email format
   - Enforce password strength (min 6 characters)

---

## UI/UX Guidelines

1. **Consistent Styling:**
   - Use same form styling as CreateTicket (black borders, white background)
   - Use gradient buttons matching app theme
   - Maintain responsive design

2. **User Feedback:**
   - Show loading states during API calls
   - Display success/error toasts
   - Form validation with inline error messages

3. **Accessibility:**
   - Proper form labels
   - Keyboard navigation support
   - Screen reader friendly

---

## Implementation Priority

### High Priority (Core Features):
1. ✅ Backend: Update own profile endpoint
2. ✅ Frontend: Profile page
3. ✅ Backend: Create user endpoint (admin)
4. ✅ Frontend: User Management page (basic)
5. ✅ Backend: Update user endpoint (admin)
6. ✅ Backend: Delete user endpoint (admin)

### Medium Priority (Enhancements):
- Search/filter in User Management
- Password strength indicator
- User activity tracking
- Bulk actions in User Management

### Low Priority (Nice to Have):
- Profile picture upload
- Email verification
- Two-factor authentication
- User activity logs

---

1

---

## Next Steps

1. **Start with Backend:**
   - Implement `PUT /api/users/me` endpoint
   - Implement `POST /api/users` endpoint (admin)
   - Implement `PUT /api/users/:id` endpoint (admin)
   - Implement `DELETE /api/users/:id` endpoint (admin)

2. **Then Frontend:**
   - Create Profile page component
   - Create User Management page component
   - Add API functions
   - Add routes and navigation

3. **Test & Refine:**
   - Test all functionality
   - Fix any bugs
   - Improve UI/UX based on feedback

---

## Questions to Consider

1. Should users be able to change their own role? (Probably NO)
2. Should there be a "soft delete" for users (mark as deleted instead of removing)? (Recommended: YES)
3. Should password change require current password verification? (Recommended: YES)
4. Should admins be able to reset user passwords? (Recommended: YES)
5. Should we track "last updated" and "last login" timestamps? (Optional)

---

**Ready to implement?** Let me know if you'd like me to start with any specific part!

