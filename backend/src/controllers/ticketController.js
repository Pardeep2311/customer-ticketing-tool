const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const generateTicketNumber = require('../utils/generateTicketNumber');

// Create new ticket (Customer or on behalf of Customer)
const createTicket = async (req, res) => {
  try {
    const {
      category_id,
      subcategory_id,
      assignment_group_id,
      subject,
      description,
      priority,
      assigned_to,
      // tags and followers removed from payload
      requester_id,
      additional_comments,
      work_notes
    } = req.body;

    const createdById = req.user.id;
    const userRole = req.user.role;

    // Determine actual customer (Caller)
    let customer_id = createdById;
    if (requester_id && (userRole === 'admin' || userRole === 'employee')) {
      const parsed = parseInt(requester_id, 10);
      if (!Number.isNaN(parsed)) {
        customer_id = parsed;
      }
    }

    // Validation
    if (!subject || !description) {
      return sendError(res, 'Subject and description are required');
    }

    // Only admin/employee can assign tickets and assignment groups
    let assigneeId = null;
    let assignmentGroupId = null;
    
    if (assigned_to && (userRole === 'admin' || userRole === 'employee')) {
      assigneeId = parseInt(assigned_to, 10) || null;
    }
    
    if (assignment_group_id && (userRole === 'admin' || userRole === 'employee')) {
      assignmentGroupId = parseInt(assignment_group_id, 10) || null;
    }

    // Validate and convert subcategory_id
    let validSubcategoryId = null;
    if (subcategory_id) {
      const subcategoryIdInt = parseInt(subcategory_id, 10);
      if (!Number.isNaN(subcategoryIdInt)) {
        // Verify subcategory exists in database
        const subcategoryCheck = await query(
          'SELECT id FROM subcategories WHERE id = ?',
          [subcategoryIdInt]
        );
        if (subcategoryCheck.length > 0) {
          validSubcategoryId = subcategoryIdInt;
        } else {
          console.warn(`Subcategory ID ${subcategoryIdInt} does not exist in database, setting to null`);
        }
      }
    }

    // Validate and convert category_id
    let validCategoryId = null;
    if (category_id) {
      const categoryIdInt = parseInt(category_id, 10);
      if (!Number.isNaN(categoryIdInt)) {
        validCategoryId = categoryIdInt;
      }
    }

    // Generate ticket number
    const ticket_number = await generateTicketNumber();

    // Insert ticket
    const result = await query(
      `INSERT INTO tickets 
       (ticket_number, customer_id, assigned_to, category_id, subcategory_id, assignment_group_id, subject, description, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket_number,
        customer_id,
        assigneeId,
        validCategoryId,
        validSubcategoryId,
        assignmentGroupId,
        subject,
        description,
        priority || 'medium'
      ]
    );

    const ticketId = result.insertId;

    // 4) Save initial comments from form (Additional comments / Work notes)
    if (additional_comments && additional_comments.trim()) {
      const commentText = additional_comments.trim();
      await query(
        `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal) 
         VALUES (?, ?, ?, 0)`,
        [ticketId, customer_id, commentText]
      );

      await query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, new_value) 
         VALUES (?, ?, 'comment_added', ?)`,
        [ticketId, createdById, JSON.stringify({ type: 'customer_comment', text: commentText })]
      );
    }

    if (work_notes && work_notes.trim() && (userRole === 'admin' || userRole === 'employee')) {
      const notesText = work_notes.trim();
      await query(
        `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal) 
         VALUES (?, ?, ?, 1)`,
        [ticketId, createdById, notesText]
      );

      await query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, new_value) 
         VALUES (?, ?, 'work_note_added', ?)`,
        [ticketId, createdById, JSON.stringify({ type: 'work_note', text: notesText })]
      );
    }

    // 5) Add "ticket created" entry to history (by creator)
    await query(
      `INSERT INTO ticket_history (ticket_id, user_id, action, new_value) 
       VALUES (?, ?, 'created', ?)`,
      [ticketId, createdById, `Ticket created: ${subject}`]
    );

    // Get created ticket with all related data
    const tickets = await query(
      `SELECT t.*, 
              u.name as customer_name, 
              u.email as customer_email,
              c.name as category_name,
              s.name as subcategory_name,
              ag.name as assignment_group_name,
              a.name as assigned_to_name,
              a.email as assigned_to_email
       FROM tickets t
       LEFT JOIN users u ON t.customer_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN subcategories s ON t.subcategory_id = s.id
       LEFT JOIN assignment_groups ag ON t.assignment_group_id = ag.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [ticketId]
    );

    sendSuccess(res, 'Ticket created successfully', tickets[0], 201);
  } catch (error) {
    console.error('Create ticket error:', error);
    sendError(res, 'Failed to create ticket', error.message, 500);
  }
};

// Get all tickets (Admin/Employee) or own tickets (Customer)
const getTickets = async (req, res) => {
  try {
    const { status, priority, category_id, assigned_to, page = 1, limit = 10 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT t.*, 
             u.name as customer_name, 
             u.email as customer_email,
             c.name as category_name,
             s.name as subcategory_name,
             ag.name as assignment_group_name,
             a.name as assigned_to_name
      FROM tickets t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      LEFT JOIN assignment_groups ag ON t.assignment_group_id = ag.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (userRole === 'customer') {
      sql += ' AND t.customer_id = ?';
      params.push(userId);
    }

    // Additional filters
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }
    if (category_id) {
      sql += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (req.query.unassigned === 'true' && (userRole === 'admin' || userRole === 'employee')) {
      sql += ' AND t.assigned_to IS NULL';
    } else if (assigned_to && (userRole === 'admin' || userRole === 'employee')) {
      sql += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    // Filter by followed tickets (favorites)
    if (req.query.followed === 'true') {
      sql += ` AND EXISTS (
        SELECT 1 FROM ticket_followers tf 
        WHERE tf.ticket_id = t.id AND tf.user_id = ?
      )`;
      params.push(userId);
    }

    // Filter by ticket IDs (for recent tickets)
    if (req.query.ticket_ids) {
      const ticketIds = req.query.ticket_ids
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !Number.isNaN(id));
      if (ticketIds.length > 0) {
        sql += ` AND t.id IN (${ticketIds.map(() => '?').join(',')})`;
        params.push(...ticketIds);
      }
    }

    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const tickets = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM tickets t WHERE 1=1';
    const countParams = [];
    if (userRole === 'customer') {
      countSql += ' AND t.customer_id = ?';
      countParams.push(userId);
    }
    if (status) {
      countSql += ' AND t.status = ?';
      countParams.push(status);
    }
    if (req.query.unassigned === 'true' && (userRole === 'admin' || userRole === 'employee')) {
      countSql += ' AND t.assigned_to IS NULL';
    } else if (assigned_to && (userRole === 'admin' || userRole === 'employee')) {
      countSql += ' AND t.assigned_to = ?';
      countParams.push(assigned_to);
    }
    if (req.query.followed === 'true') {
      countSql += ` AND EXISTS (
        SELECT 1 FROM ticket_followers tf 
        WHERE tf.ticket_id = t.id AND tf.user_id = ?
      )`;
      countParams.push(userId);
    }
    if (req.query.ticket_ids) {
      const ticketIds = req.query.ticket_ids
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !Number.isNaN(id));
      if (ticketIds.length > 0) {
        countSql += ` AND t.id IN (${ticketIds.map(() => '?').join(',')})`;
        countParams.push(...ticketIds);
      }
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0]?.total || 0;

    sendSuccess(res, 'Tickets retrieved successfully', {
      tickets,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    sendError(res, 'Failed to retrieve tickets', error.message, 500);
  }
};

// Get single ticket
const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const tickets = await query(
      `SELECT t.*, 
              u.name as customer_name, 
              u.email as customer_email,
              c.name as category_name,
              s.name as subcategory_name,
              ag.name as assignment_group_name,
              a.name as assigned_to_name,
              a.email as assigned_to_email
       FROM tickets t
       LEFT JOIN users u ON t.customer_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN subcategories s ON t.subcategory_id = s.id
       LEFT JOIN assignment_groups ag ON t.assignment_group_id = ag.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    const ticket = tickets[0];

    // Check access (customer can only see own tickets)
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
        [id]
      );
    } else {
      comments = await query(
        `SELECT tc.*, u.name as user_name, u.role as user_role
         FROM ticket_comments tc
         LEFT JOIN users u ON tc.user_id = u.id
         WHERE tc.ticket_id = ?
         ORDER BY tc.created_at ASC`,
        [id]
      );
    }

    // Get history
    const history = await query(
      `SELECT th.*, u.name as user_name, u.role as user_role
       FROM ticket_history th
       LEFT JOIN users u ON th.user_id = u.id
       WHERE th.ticket_id = ?
       ORDER BY th.created_at DESC`,
      [id]
    );

    sendSuccess(res, 'Ticket retrieved successfully', {
      ...ticket,
      comments,
      history
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    sendError(res, 'Failed to retrieve ticket', error.message, 500);
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, status, priority, assigned_to, resolution } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Get current ticket
    const tickets = await query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    const ticket = tickets[0];

    // Check permissions
    if (userRole === 'customer') {
      // Customer can only update subject and description
      if (status || priority || assigned_to || resolution) {
        return sendError(res, 'You can only update subject and description', null, 403);
      }
      if (ticket.customer_id !== userId) {
        return sendError(res, 'Access denied', null, 403);
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (subject) {
      updates.push('subject = ?');
      params.push(subject);
    }
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status && (userRole === 'admin' || userRole === 'employee')) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (priority && (userRole === 'admin' || userRole === 'employee')) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (assigned_to && (userRole === 'admin' || userRole === 'employee')) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }
    if (resolution && (userRole === 'admin' || userRole === 'employee')) {
      updates.push('resolution = ?');
      params.push(resolution);
    }

    if (updates.length === 0) {
      return sendError(res, 'No fields to update');
    }

    params.push(id);
    await query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Add to history
    await query(
      `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value) 
       VALUES (?, ?, 'updated', ?, ?)`,
      [id, userId, JSON.stringify(ticket), JSON.stringify(req.body)]
    );

    // Get updated ticket
    const updatedTickets = await query(
      `SELECT t.*, 
              u.name as customer_name, 
              u.email as customer_email,
              c.name as category_name,
              s.name as subcategory_name,
              ag.name as assignment_group_name,
              a.name as assigned_to_name
       FROM tickets t
       LEFT JOIN users u ON t.customer_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN subcategories s ON t.subcategory_id = s.id
       LEFT JOIN assignment_groups ag ON t.assignment_group_id = ag.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [id]
    );

    sendSuccess(res, 'Ticket updated successfully', updatedTickets[0]);
  } catch (error) {
    console.error('Update ticket error:', error);
    sendError(res, 'Failed to update ticket', error.message, 500);
  }
};

// Delete ticket (Admin only)
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const tickets = await query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    await query('DELETE FROM tickets WHERE id = ?', [id]);

    sendSuccess(res, 'Ticket deleted successfully');
  } catch (error) {
    console.error('Delete ticket error:', error);
    sendError(res, 'Failed to delete ticket', error.message, 500);
  }
};

// Get next ticket number (preview without creating ticket)
const getNextTicketNumber = async (req, res) => {
  try {
    const ticket_number = await generateTicketNumber();
    return sendSuccess(res, { ticket_number }, 'Next ticket number generated');
  } catch (error) {
    console.error('Error getting next ticket number:', error);
    return sendError(res, 'Failed to generate ticket number', 500);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  getNextTicketNumber
};


