const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { is_read, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    const params = [user_id];

    if (is_read !== undefined) {
      sql += ' AND is_read = ?';
      params.push(is_read === 'true');
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const notifications = await query(sql, params);

    // Get unread count
    const unreadResult = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );
    const unreadCount = unreadResult[0]?.count || 0;

    sendSuccess(res, 'Notifications retrieved successfully', {
      notifications,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, 'Failed to retrieve notifications', error.message, 500);
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verify notification belongs to user
    const notifications = await query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (notifications.length === 0) {
      return sendError(res, 'Notification not found', null, 404);
    }

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    sendSuccess(res, 'Notification marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    sendError(res, 'Failed to mark notification as read', error.message, 500);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );

    sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all as read error:', error);
    sendError(res, 'Failed to mark all notifications as read', error.message, 500);
  }
};

// Create notification (usually called by other controllers)
const createNotification = async (user_id, title, message, type, link = null) => {
  try {
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, title, message, type, link]
    );
    return true;
  } catch (error) {
    console.error('Create notification error:', error);
    return false;
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verify notification belongs to user
    const notifications = await query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (notifications.length === 0) {
      return sendError(res, 'Notification not found', null, 404);
    }

    await query('DELETE FROM notifications WHERE id = ?', [id]);

    sendSuccess(res, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    sendError(res, 'Failed to delete notification', error.message, 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
};

