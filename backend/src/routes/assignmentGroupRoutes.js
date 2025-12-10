const express = require('express');
const router = express.Router();
const {
  getAssignmentGroups,
  getAssignmentGroup,
  getGroupMembers
} = require('../controllers/assignmentGroupController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get all assignment groups (admin, employee, customer can view)
router.get('/', getAssignmentGroups);

// Get single assignment group
router.get('/:id', getAssignmentGroup);

// Get members of an assignment group
router.get('/:id/members', getGroupMembers);

module.exports = router;

