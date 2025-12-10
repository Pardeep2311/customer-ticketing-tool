const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Add comment to ticket
router.post('/tickets/:ticketId/comments', addComment);

// Get comments for a ticket
router.get('/tickets/:ticketId/comments', getComments);

// Update comment
router.put('/tickets/:ticketId/comments/:commentId', updateComment);

// Delete comment
router.delete('/tickets/:ticketId/comments/:commentId', deleteComment);

module.exports = router;

