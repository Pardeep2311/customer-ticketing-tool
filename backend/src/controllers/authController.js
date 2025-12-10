const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Register new user (Customer)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser && existingUser.length > 0) {
      return sendError(res, 'User with this email already exists', null, 409);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user (default role: customer)
    let result;
    try {
      result = await query(
        `INSERT INTO users (name, email, password, role) 
         VALUES (?, ?, ?, 'customer')`,
        [name, email, hashedPassword]
      );
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        return sendError(res, 'Database schema error: password column may not exist', null, 500);
      }
      throw dbError;
    }

    // For INSERT queries, result should have insertId property
    const userId = result.insertId;
    
    if (!userId) {
      console.error('Insert result:', result);
      throw new Error('Failed to get user ID after insertion');
    }

    // Verify password was saved by checking the user
    const verifyUser = await query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!verifyUser || verifyUser.length === 0) {
      throw new Error('Failed to retrieve created user');
    }
    
    // Check if password is NULL (shouldn't happen)
    if (!verifyUser[0].password) {
      console.error('WARNING: Password was not saved! User:', verifyUser[0]);
      return sendError(res, 'Password was not saved. Please check database schema.', null, 500);
    }

    // Get created user (without password) for response
    const newUser = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser[0].id, 
        email: newUser[0].email, 
        role: newUser[0].role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    sendSuccess(res, 'User registered successfully', {
      user: newUser && newUser.length > 0 ? newUser[0] : null,
      token
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Registration failed', error.message, 500);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    // Find user
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!users || users.length === 0) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return sendError(res, 'Account is deactivated', null, 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, 'Login successful', {
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', error.message, 500);
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }

    sendSuccess(res, 'User retrieved successfully', users[0]);
  } catch (error) {
    console.error('Get me error:', error);
    sendError(res, 'Failed to retrieve user', error.message, 500);
  }
};

module.exports = {
  register,
  login,
  getMe
};

