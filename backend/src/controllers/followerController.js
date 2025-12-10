const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get followers for a ticket
const getTicketFollowers = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const followers = await query(
      `SELECT u.id, u.name, u.email, u.role, tf.created_at
       FROM ticket_followers tf
       JOIN users u ON tf.user_id = u.id
       WHERE tf.ticket_id = ?
       ORDER BY tf.created_at ASC`,
      [ticketId]
    );

    sendSuccess(res, 'Ticket followers retrieved successfully', followers);
  } catch (error) {
    console.error('Get ticket followers error:', error);
    sendError(res, 'Failed to retrieve ticket followers', error.message, 500);
  }
};

// Add follower to ticket
const addFollower = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { user_id } = req.body;
    const currentUserId = req.user.id;

    // Use provided user_id or current user
    const followerId = user_id || currentUserId;

    // Check if ticket exists
    const tickets = await query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    // Check if already following
    const existing = await query(
      'SELECT id FROM ticket_followers WHERE ticket_id = ? AND user_id = ?',
      [ticketId, followerId]
    );

    if (existing.length > 0) {
      return sendError(res, 'User is already following this ticket');
    }

    await query(
      'INSERT INTO ticket_followers (ticket_id, user_id) VALUES (?, ?)',
      [ticketId, followerId]
    );

    // Get updated followers list
    const followers = await query(
      `SELECT u.id, u.name, u.email, u.role, tf.created_at
       FROM ticket_followers tf
       JOIN users u ON tf.user_id = u.id
       WHERE tf.ticket_id = ?`,
      [ticketId]
    );

    sendSuccess(res, 'Follower added successfully', followers);
  } catch (error) {
    console.error('Add follower error:', error);
    sendError(res, 'Failed to add follower', error.message, 500);
  }
};

// Remove follower from ticket
const removeFollower = async (req, res) => {
  try {
    const { ticketId, userId } = req.params;
    const currentUserId = req.user.id;

    // If userId is provided in params, use it (for /ticket/:ticketId/user/:userId route)
    // Otherwise, remove current user (for /ticket/:ticketId route)
    const targetUserId = userId || currentUserId;
    
    // Users can only remove themselves, admins can remove anyone
    if (targetUserId !== currentUserId && req.user.role !== 'admin') {
      return sendError(res, 'You can only remove yourself as a follower', null, 403);
    }

    await query(
      'DELETE FROM ticket_followers WHERE ticket_id = ? AND user_id = ?',
      [ticketId, targetUserId]
    );

    sendSuccess(res, 'Follower removed successfully');
  } catch (error) {
    console.error('Remove follower error:', error);
    sendError(res, 'Failed to remove follower', error.message, 500);
  }
};

// Check if user is following ticket
const checkFollowing = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const followers = await query(
      'SELECT id FROM ticket_followers WHERE ticket_id = ? AND user_id = ?',
      [ticketId, userId]
    );

    sendSuccess(res, 'Following status retrieved', {
      is_following: followers.length > 0
    });
  } catch (error) {
    console.error('Check following error:', error);
    sendError(res, 'Failed to check following status', error.message, 500);
  }
};

module.exports = {
  getTicketFollowers,
  addFollower,
  removeFollower,
  checkFollowing
};

