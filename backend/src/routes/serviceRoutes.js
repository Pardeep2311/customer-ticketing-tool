const express = require('express');
const router = express.Router();
const {
  getServiceItems,
  getServiceItem,
  createServiceRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  getCategories
} = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get service items (public)
router.get('/items', getServiceItems);

// Get single service item
router.get('/items/:id', getServiceItem);

// Get categories
router.get('/categories', getCategories);

// Create service request
router.post('/requests', createServiceRequest);

// Get my requests
router.get('/requests/my', getMyRequests);

// Get all requests (Admin/Employee only)
router.get('/requests', authorize(['admin', 'employee']), getAllRequests);

// Update request status (Admin/Employee only)
router.put('/requests/:id/status', authorize(['admin', 'employee']), updateRequestStatus);

module.exports = router;

