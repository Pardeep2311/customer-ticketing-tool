const express = require('express');
const router = express.Router();
const {
  getTags,
  createTag,
  getTicketTags,
  addTagToTicket,
  removeTagFromTicket
} = require('../controllers/tagController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get all tags
router.get('/', getTags);

// Create tag (Admin only)
router.post('/', authorize(['admin']), createTag);

// Get tags for a ticket
router.get('/ticket/:ticketId', getTicketTags);

// Add tag to ticket
router.post('/ticket/:ticketId', addTagToTicket);

// Remove tag from ticket
router.delete('/ticket/:ticketId/:tagId', removeTagFromTicket);

module.exports = router;

