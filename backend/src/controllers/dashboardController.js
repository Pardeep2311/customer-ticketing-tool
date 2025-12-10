const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Customer Dashboard
const getCustomerDashboard = async (req, res) => {
  try {
    const customer_id = req.user.id;

    // Get ticket counts by status
    const statusCounts = await query(
      `SELECT status, COUNT(*) as count 
       FROM tickets 
       WHERE customer_id = ? 
       GROUP BY status`,
      [customer_id]
    );

    // Get total tickets
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM tickets WHERE customer_id = ?',
      [customer_id]
    );

    // Get recent tickets
    const recentTickets = await query(
      `SELECT t.*, c.name as category_name
       FROM tickets t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.customer_id = ?
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [customer_id]
    );

    // Get priority breakdown
    const priorityCounts = await query(
      `SELECT priority, COUNT(*) as count 
       FROM tickets 
       WHERE customer_id = ? 
       GROUP BY priority`,
      [customer_id]
    );

    // Get tickets by company (for the logged-in customer)
    const companyCounts = await query(
      `SELECT u.name, u.id, COUNT(t.id) as count 
       FROM users u
       LEFT JOIN tickets t ON u.id = t.customer_id
       WHERE u.id = ? AND u.role = 'customer'
       GROUP BY u.id, u.name
       HAVING COUNT(t.id) > 0`,
      [customer_id]
    );

    const stats = {
      total: totalResult[0]?.total || 0,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      byPriority: priorityCounts.reduce((acc, item) => {
        acc[item.priority] = item.count;
        return acc;
      }, {}),
      byCompany: companyCounts,
      recentTickets
    };

    sendSuccess(res, 'Dashboard data retrieved successfully', stats);
  } catch (error) {
    console.error('Customer dashboard error:', error);
    sendError(res, 'Failed to retrieve dashboard data', error.message, 500);
  }
};

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
  try {
    // Total tickets
    const totalResult = await query('SELECT COUNT(*) as total FROM tickets');
    const total = totalResult[0]?.total || 0;

    // Tickets by status
    const statusCounts = await query(
      'SELECT status, COUNT(*) as count FROM tickets GROUP BY status'
    );

    // Tickets by priority
    const priorityCounts = await query(
      'SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority'
    );

    // Tickets by category
    const categoryCounts = await query(
      `SELECT c.name, COUNT(t.id) as count 
       FROM categories c
       LEFT JOIN tickets t ON c.id = t.category_id
       GROUP BY c.id, c.name`
    );

    // Tickets by company (customer)
    const companyCounts = await query(
      `SELECT u.name, u.id, COUNT(t.id) as count 
       FROM users u
       LEFT JOIN tickets t ON u.id = t.customer_id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name
       HAVING COUNT(t.id) > 0
       ORDER BY count DESC`
    );

    // Tickets by assigned employee
    const assignedCounts = await query(
      `SELECT u.name, u.id, COUNT(t.id) as count 
       FROM users u
       LEFT JOIN tickets t ON u.id = t.assigned_to
       WHERE u.role IN ('admin', 'employee')
       GROUP BY u.id, u.name`
    );

    // Recent tickets
    const recentTickets = await query(
      `SELECT t.*, 
              u.name as customer_name,
              c.name as category_name,
              a.name as assigned_to_name
       FROM tickets t
       LEFT JOIN users u ON t.customer_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ORDER BY t.created_at DESC
       LIMIT 10`
    );

    // User statistics
    const userStats = await query(
      `SELECT role, COUNT(*) as count 
       FROM users 
       WHERE is_active = 1 
       GROUP BY role`
    );

    // Unassigned tickets
    const unassignedResult = await query(
      'SELECT COUNT(*) as count FROM tickets WHERE assigned_to IS NULL AND status != "closed"'
    );

    const stats = {
      total,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      byPriority: priorityCounts.reduce((acc, item) => {
        acc[item.priority] = item.count;
        return acc;
      }, {}),
      byCategory: categoryCounts,
      byCompany: companyCounts,
      byAssigned: assignedCounts,
      unassigned: unassignedResult[0]?.count || 0,
      userStats: userStats.reduce((acc, item) => {
        acc[item.role] = item.count;
        return acc;
      }, {}),
      recentTickets
    };

    sendSuccess(res, 'Dashboard data retrieved successfully', stats);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    sendError(res, 'Failed to retrieve dashboard data', error.message, 500);
  }
};

module.exports = {
  getCustomerDashboard,
  getAdminDashboard
};

