const express = require('express');
const router = express.Router();
const {
  getTicketFollowers,
  addFollower,
  removeFollower,
  checkFollowing
} = require('../controllers/followerController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get followers for a ticket
router.get('/ticket/:ticketId', getTicketFollowers);

// Check if user is following
router.get('/ticket/:ticketId/check', checkFollowing);

// Add follower to ticket
router.post('/ticket/:ticketId', addFollower);

// Remove follower from ticket (remove self if no userId)
router.delete('/ticket/:ticketId', removeFollower);

// Remove specific follower from ticket (admin only)
router.delete('/ticket/:ticketId/user/:userId', removeFollower);

module.exports = router;

