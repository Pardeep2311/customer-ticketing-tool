const express = require('express');
const router = express.Router();
const { getUsers, getUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Admin and employees can view users
router.get('/', getUsers);
router.get('/:id', getUser);

module.exports = router;

