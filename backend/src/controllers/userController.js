const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all users (filtered by role if provided)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let users;
    
    if (role) {
      // Support comma-separated roles like "employee,admin"
      const roles = role.split(',').map(r => r.trim());
      const placeholders = roles.map(() => '?').join(',');
      users = await query(
        `SELECT id, name, email, company, role, is_active, created_at 
         FROM users 
         WHERE role IN (${placeholders}) 
         ORDER BY name ASC`,
        roles
      );
    } else {
      users = await query(
        `SELECT id, name, email, company, role, is_active, created_at 
         FROM users 
         ORDER BY name ASC`
      );
    }
    
    sendSuccess(res, 'Users retrieved successfully', users);
  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 'Failed to retrieve users', error.message, 500);
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await query(
      `SELECT id, name, email, company, role, is_active, created_at 
       FROM users 
       WHERE id = ?`,
      [id]
    );
    
    if (users.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }
    
    sendSuccess(res, 'User retrieved successfully', users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 'Failed to retrieve user', error.message, 500);
  }
};

// Update own profile (authenticated users can update their own profile)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, company, currentPassword, newPassword } = req.body;

    // Validation
    if (!name || !email) {
      return sendError(res, 'Name and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format');
    }

    // Get current user data
    const currentUser = await query(
      'SELECT id, name, email, password FROM users WHERE id = ?',
      [userId]
    );

    if (currentUser.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }

    // Check if email is being changed and if new email already exists
    if (email !== currentUser[0].email) {
      const emailExists = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailExists.length > 0) {
        return sendError(res, 'Email already exists', null, 409);
      }
    }

    // If password is being changed, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 'Current password is required to change password');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser[0].password
      );

      if (!isPasswordValid) {
        return sendError(res, 'Current password is incorrect', null, 401);
      }

      // Validate new password
      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters long');
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user with new password
      if (company !== undefined) {
        await query(
          'UPDATE users SET name = ?, email = ?, company = ?, password = ? WHERE id = ?',
          [name, email, company || null, hashedPassword, userId]
        );
      } else {
        await query(
          'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
          [name, email, hashedPassword, userId]
        );
      }
    } else {
      // Update user without changing password
      if (company !== undefined) {
        await query(
          'UPDATE users SET name = ?, email = ?, company = ? WHERE id = ?',
          [name, email, company || null, userId]
        );
      } else {
        await query(
          'UPDATE users SET name = ?, email = ? WHERE id = ?',
          [name, email, userId]
        );
      }
    }

    // Get updated user data (without password)
    const updatedUser = await query(
      `SELECT id, name, email, company, role, is_active, created_at 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    sendSuccess(res, 'Profile updated successfully', updatedUser[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'Failed to update profile', error.message, 500);
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return sendError(res, 'Name, email, password, and role are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format');
    }

    // Validate role
    const validRoles = ['customer', 'employee', 'admin'];
    if (!validRoles.includes(role)) {
      return sendError(res, 'Invalid role. Must be one of: customer, employee, admin');
    }

    // Validate password
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return sendError(res, 'User with this email already exists', null, 409);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (name, email, password, role, company, is_active) 
       VALUES (?, ?, ?, ?, ?, true)`,
      [name, email, hashedPassword, role, company || null]
    );

    const userId = result.insertId;

    if (!userId) {
      return sendError(res, 'Failed to create user', null, 500);
    }

    // Get created user data (without password)
    const newUser = await query(
      `SELECT id, name, email, company, role, is_active, created_at 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    sendSuccess(res, 'User created successfully', newUser[0], 201);
  } catch (error) {
    console.error('Create user error:', error);
    sendError(res, 'Failed to create user', error.message, 500);
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active, password, company } = req.body;
    const currentUserId = req.user.id;

    // Validation
    if (!name || !email || role === undefined) {
      return sendError(res, 'Name, email, and role are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format');
    }

    // Validate role
    const validRoles = ['customer', 'employee', 'admin'];
    if (!validRoles.includes(role)) {
      return sendError(res, 'Invalid role. Must be one of: customer, employee, admin');
    }

    // Check if user exists
    const user = await query(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }

    // Prevent admin from changing their own role to non-admin
    if (parseInt(id) === currentUserId && role !== 'admin') {
      return sendError(res, 'You cannot change your own role from admin', null, 403);
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === currentUserId && is_active === false) {
      return sendError(res, 'You cannot deactivate your own account', null, 403);
    }

    // Check if email is being changed and if new email already exists
    const currentUser = await query(
      'SELECT email FROM users WHERE id = ?',
      [id]
    );

    if (email !== currentUser[0].email) {
      const emailExists = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailExists.length > 0) {
        return sendError(res, 'Email already exists', null, 409);
      }
    }

    // Build update query
    let updateFields = ['name = ?', 'email = ?', 'role = ?'];
    let updateValues = [name, email, role];

    // Add company if provided
    if (company !== undefined) {
      updateFields.push('company = ?');
      updateValues.push(company || null);
    }

    // Add is_active if provided
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    // Add password if provided
    if (password) {
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long');
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    updateValues.push(id);

    // Update user
    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user data (without password)
    const updatedUser = await query(
      `SELECT id, name, email, company, role, is_active, created_at 
       FROM users 
       WHERE id = ?`,
      [id]
    );

    sendSuccess(res, 'User updated successfully', updatedUser[0]);
  } catch (error) {
    console.error('Update user error:', error);
    sendError(res, 'Failed to update user', error.message, 500);
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Prevent admin from deleting themselves
    if (parseInt(id) === currentUserId) {
      return sendError(res, 'You cannot delete your own account', null, 403);
    }

    // Check if user exists
    const user = await query(
      'SELECT id, name FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }

    // Check if user has associated tickets (optional: for soft delete consideration)
    const tickets = await query(
      'SELECT COUNT(*) as count FROM tickets WHERE created_by = ? OR assigned_to = ?',
      [id, id]
    );

    const ticketCount = tickets[0]?.count || 0;

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id]);

    sendSuccess(res, 'User deleted successfully', {
      deletedUserId: id,
      deletedUserName: user[0].name,
      associatedTickets: ticketCount
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Handle foreign key constraint errors
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      return sendError(res, 'Cannot delete user. User has associated tickets. Consider deactivating instead.', null, 409);
    }

    sendError(res, 'Failed to delete user', error.message, 500);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateProfile,
  createUser,
  updateUser,
  deleteUser
};

