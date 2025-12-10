const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all service items
const getServiceItems = async (req, res) => {
  try {
    const { category_id, is_active = true } = req.query;

    let sql = `
      SELECT si.*, 
             sc.name as category_name
      FROM service_items si
      LEFT JOIN service_categories sc ON si.category_id = sc.id
      WHERE si.is_active = ?
    `;
    const params = [is_active];

    if (category_id) {
      sql += ' AND si.category_id = ?';
      params.push(category_id);
    }

    sql += ' ORDER BY si.name ASC';

    const items = await query(sql, params);

    sendSuccess(res, 'Service items retrieved successfully', items);
  } catch (error) {
    console.error('Get service items error:', error);
    sendError(res, 'Failed to retrieve service items', error.message, 500);
  }
};

// Get single service item
const getServiceItem = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await query(
      `SELECT si.*, 
              sc.name as category_name
       FROM service_items si
       LEFT JOIN service_categories sc ON si.category_id = sc.id
       WHERE si.id = ?`,
      [id]
    );

    if (items.length === 0) {
      return sendError(res, 'Service item not found', null, 404);
    }

    sendSuccess(res, 'Service item retrieved successfully', items[0]);
  } catch (error) {
    console.error('Get service item error:', error);
    sendError(res, 'Failed to retrieve service item', error.message, 500);
  }
};

// Create service request
const createServiceRequest = async (req, res) => {
  try {
    const { service_item_id, description } = req.body;
    const user_id = req.user.id;

    if (!service_item_id) {
      return sendError(res, 'Service item ID is required');
    }

    // Get service item to check if approval is required
    const serviceItems = await query(
      'SELECT * FROM service_items WHERE id = ? AND is_active = TRUE',
      [service_item_id]
    );

    if (serviceItems.length === 0) {
      return sendError(res, 'Service item not found or inactive');
    }

    const serviceItem = serviceItems[0];

    const result = await query(
      `INSERT INTO service_requests (service_item_id, user_id, description, status) 
       VALUES (?, ?, ?, ?)`,
      [
        service_item_id,
        user_id,
        description || null,
        serviceItem.requires_approval ? 'pending' : 'approved'
      ]
    );

    // Get created request with details
    const requests = await query(
      `SELECT sr.*, 
              si.name as service_name,
              si.description as service_description,
              u.name as user_name,
              u.email as user_email
       FROM service_requests sr
       JOIN service_items si ON sr.service_item_id = si.id
       JOIN users u ON sr.user_id = u.id
       WHERE sr.id = ?`,
      [result.insertId]
    );

    sendSuccess(res, 'Service request created successfully', requests[0], 201);
  } catch (error) {
    console.error('Create service request error:', error);
    sendError(res, 'Failed to create service request', error.message, 500);
  }
};

// Get user's service requests
const getMyRequests = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status } = req.query;

    let sql = `
      SELECT sr.*, 
             si.name as service_name,
             si.description as service_description,
             u.name as approver_name
      FROM service_requests sr
      JOIN service_items si ON sr.service_item_id = si.id
      LEFT JOIN users u ON sr.approved_by = u.id
      WHERE sr.user_id = ?
    `;
    const params = [user_id];

    if (status) {
      sql += ' AND sr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY sr.created_at DESC';

    const requests = await query(sql, params);

    sendSuccess(res, 'Service requests retrieved successfully', requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    sendError(res, 'Failed to retrieve service requests', error.message, 500);
  }
};

// Get all service requests (Admin/Employee)
const getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT sr.*, 
             si.name as service_name,
             u.name as user_name,
             u.email as user_email,
             approver.name as approver_name
      FROM service_requests sr
      JOIN service_items si ON sr.service_item_id = si.id
      JOIN users u ON sr.user_id = u.id
      LEFT JOIN users approver ON sr.approved_by = approver.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND sr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY sr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const requests = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM service_requests WHERE 1=1';
    const countParams = [];
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0]?.total || 0;

    sendSuccess(res, 'Service requests retrieved successfully', {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    sendError(res, 'Failed to retrieve service requests', error.message, 500);
  }
};

// Approve/Reject service request (Admin/Employee)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return sendError(res, 'Invalid status');
    }

    const updates = ['status = ?'];
    const params = [status];

    if (status === 'approved') {
      updates.push('approved_by = ?', 'approved_at = NOW()');
      params.push(user_id);
    }

    if (status === 'completed') {
      updates.push('completed_at = NOW()');
    }

    params.push(id);

    await query(
      `UPDATE service_requests SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated request
    const requests = await query(
      `SELECT sr.*, 
              si.name as service_name,
              u.name as user_name
       FROM service_requests sr
       JOIN service_items si ON sr.service_item_id = si.id
       JOIN users u ON sr.user_id = u.id
       WHERE sr.id = ?`,
      [id]
    );

    sendSuccess(res, 'Service request updated successfully', requests[0]);
  } catch (error) {
    console.error('Update request status error:', error);
    sendError(res, 'Failed to update service request', error.message, 500);
  }
};

// Get service categories
const getCategories = async (req, res) => {
  try {
    const categories = await query(
      'SELECT * FROM service_categories ORDER BY name ASC'
    );

    sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to retrieve categories', error.message, 500);
  }
};

module.exports = {
  getServiceItems,
  getServiceItem,
  createServiceRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  getCategories
};

