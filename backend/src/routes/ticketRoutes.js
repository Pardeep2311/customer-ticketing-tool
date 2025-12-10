const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  getNextTicketNumber
} = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Customer and Staff can create tickets
router.post('/', createTicket);

// Get tickets (filtered by role)
router.get('/', getTickets);

// Get next ticket number (preview)
router.get('/next-number', getNextTicketNumber);

// Get single ticket
router.get('/:id', getTicket);

// Update ticket
router.put('/:id', updateTicket);

// Delete ticket (Admin only)
router.delete('/:id', authorize('admin'), deleteTicket);

module.exports = router;

