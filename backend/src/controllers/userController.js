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
        `SELECT id, name, email, role, is_active, created_at 
         FROM users 
         WHERE role IN (${placeholders}) 
         ORDER BY name ASC`,
        roles
      );
    } else {
      users = await query(
        `SELECT id, name, email, role, is_active, created_at 
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
      `SELECT id, name, email, role, is_active, created_at 
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

module.exports = {
  getUsers,
  getUser
};

