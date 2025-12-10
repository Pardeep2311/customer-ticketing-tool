const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Add comment to ticket
const addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { comment, is_internal } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validation
    if (!comment || !comment.trim()) {
      return sendError(res, 'Comment is required');
    }

    // Check if ticket exists
    const tickets = await query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    const ticket = tickets[0];

    // Check access (customer can only comment on own tickets)
    if (userRole === 'customer' && ticket.customer_id !== userId) {
      return sendError(res, 'Access denied', null, 403);
    }

    // Customers cannot create internal comments
    const internal = userRole !== 'customer' ? (is_internal || false) : false;

    // Insert comment
    const result = await query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal) 
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, comment.trim(), internal]
    );

    // Get created comment with user info
    const comments = await query(
      `SELECT tc.*, u.name as user_name, u.role as user_role
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [result.insertId]
    );

    // Update ticket updated_at
    await query('UPDATE tickets SET updated_at = NOW() WHERE id = ?', [ticketId]);

    sendSuccess(res, 'Comment added successfully', comments[0], 201);
  } catch (error) {
    console.error('Add comment error:', error);
    sendError(res, 'Failed to add comment', error.message, 500);
  }
};

// Get comments for a ticket
const getComments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if ticket exists
    const tickets = await query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    const ticket = tickets[0];

    // Check access
    if (userRole === 'customer' && ticket.customer_id !== userId) {
      return sendError(res, 'Access denied', null, 403);
    }

    // Get comments (customers can't see internal comments)
    let comments;
    if (userRole === 'customer') {
      comments = await query(
        `SELECT tc.*, u.name as user_name, u.role as user_role
         FROM ticket_comments tc
         LEFT JOIN users u ON tc.user_id = u.id
         WHERE tc.ticket_id = ? AND tc.is_internal = 0
         ORDER BY tc.created_at ASC`,
        [ticketId]
      );
    } else {
      comments = await query(
        `SELECT tc.*, u.name as user_name, u.role as user_role
         FROM ticket_comments tc
         LEFT JOIN users u ON tc.user_id = u.id
         WHERE tc.ticket_id = ?
         ORDER BY tc.created_at ASC`,
        [ticketId]
      );
    }

    sendSuccess(res, 'Comments retrieved successfully', comments);
  } catch (error) {
    console.error('Get comments error:', error);
    sendError(res, 'Failed to retrieve comments', error.message, 500);
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { ticketId, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || !comment.trim()) {
      return sendError(res, 'Comment is required');
    }

    // Check if comment exists and belongs to user
    const comments = await query(
      'SELECT * FROM ticket_comments WHERE id = ? AND ticket_id = ?',
      [commentId, ticketId]
    );

    if (comments.length === 0) {
      return sendError(res, 'Comment not found', null, 404);
    }

    // Users can only update their own comments
    if (comments[0].user_id !== userId) {
      return sendError(res, 'You can only update your own comments', null, 403);
    }

    // Update comment
    await query(
      'UPDATE ticket_comments SET comment = ?, updated_at = NOW() WHERE id = ?',
      [comment.trim(), commentId]
    );

    // Get updated comment
    const updated = await query(
      `SELECT tc.*, u.name as user_name, u.role as user_role
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [commentId]
    );

    sendSuccess(res, 'Comment updated successfully', updated[0]);
  } catch (error) {
    console.error('Update comment error:', error);
    sendError(res, 'Failed to update comment', error.message, 500);
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { ticketId, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if comment exists
    const comments = await query(
      'SELECT * FROM ticket_comments WHERE id = ? AND ticket_id = ?',
      [commentId, ticketId]
    );

    if (comments.length === 0) {
      return sendError(res, 'Comment not found', null, 404);
    }

    // Users can delete their own comments, admins can delete any
    if (comments[0].user_id !== userId && userRole !== 'admin') {
      return sendError(res, 'Access denied', null, 403);
    }

    await query('DELETE FROM ticket_comments WHERE id = ?', [commentId]);
    sendSuccess(res, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    sendError(res, 'Failed to delete comment', error.message, 500);
  }
};

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment
};

