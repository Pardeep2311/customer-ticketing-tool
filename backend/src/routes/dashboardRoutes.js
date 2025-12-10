const express = require('express');
const router = express.Router();
const { getCustomerDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Customer dashboard
router.get('/customer', getCustomerDashboard);

// Admin dashboard
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;

