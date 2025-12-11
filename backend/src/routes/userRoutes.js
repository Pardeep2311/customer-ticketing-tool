const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  updateProfile, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get all users (admin and employees can view)
router.get('/', getUsers);

// Update own profile (all authenticated users)
router.put('/me', updateProfile);

// Create user (admin only) - must come before /:id route
router.post('/', authorize('admin'), createUser);

// Get single user (admin and employees can view)
router.get('/:id', getUser);

// Update user (admin only)
router.put('/:id', authorize('admin'), updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;

