const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all tags
const getTags = async (req, res) => {
  try {
    const tags = await query('SELECT * FROM tags ORDER BY name ASC');
    sendSuccess(res, 'Tags retrieved successfully', tags);
  } catch (error) {
    console.error('Get tags error:', error);
    sendError(res, 'Failed to retrieve tags', error.message, 500);
  }
};

// Create tag (Admin only)
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 'Tag name is required');
    }

    // Check if tag already exists
    const existing = await query('SELECT id FROM tags WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return sendError(res, 'Tag with this name already exists', null, 409);
    }

    const result = await query(
      'INSERT INTO tags (name, color) VALUES (?, ?)',
      [name.trim(), color || '#3B82F6']
    );

    const tags = await query('SELECT * FROM tags WHERE id = ?', [result.insertId]);
    sendSuccess(res, 'Tag created successfully', tags[0], 201);
  } catch (error) {
    console.error('Create tag error:', error);
    sendError(res, 'Failed to create tag', error.message, 500);
  }
};

// Get tags for a ticket
const getTicketTags = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const tags = await query(
      `SELECT t.* FROM tags t
       JOIN ticket_tags tt ON t.id = tt.tag_id
       WHERE tt.ticket_id = ?
       ORDER BY t.name ASC`,
      [ticketId]
    );

    sendSuccess(res, 'Ticket tags retrieved successfully', tags);
  } catch (error) {
    console.error('Get ticket tags error:', error);
    sendError(res, 'Failed to retrieve ticket tags', error.message, 500);
  }
};

// Add tag to ticket
const addTagToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { tag_id, tag_name } = req.body;

    let tagId = tag_id;

    // If tag_name provided, find or create tag
    if (tag_name && !tag_id) {
      let tags = await query('SELECT id FROM tags WHERE name = ?', [tag_name.trim()]);
      
      if (tags.length === 0) {
        // Create new tag
        const result = await query(
          'INSERT INTO tags (name) VALUES (?)',
          [tag_name.trim()]
        );
        tagId = result.insertId;
      } else {
        tagId = tags[0].id;
      }
    }

    if (!tagId) {
      return sendError(res, 'Tag ID or tag name is required');
    }

    // Check if already tagged
    const existing = await query(
      'SELECT id FROM ticket_tags WHERE ticket_id = ? AND tag_id = ?',
      [ticketId, tagId]
    );

    if (existing.length > 0) {
      return sendError(res, 'Tag already added to ticket');
    }

    await query(
      'INSERT INTO ticket_tags (ticket_id, tag_id) VALUES (?, ?)',
      [ticketId, tagId]
    );

    const tags = await query(
      `SELECT t.* FROM tags t
       JOIN ticket_tags tt ON t.id = tt.tag_id
       WHERE tt.ticket_id = ?`,
      [ticketId]
    );

    sendSuccess(res, 'Tag added to ticket successfully', tags);
  } catch (error) {
    console.error('Add tag to ticket error:', error);
    sendError(res, 'Failed to add tag to ticket', error.message, 500);
  }
};

// Remove tag from ticket
const removeTagFromTicket = async (req, res) => {
  try {
    const { ticketId, tagId } = req.params;

    await query(
      'DELETE FROM ticket_tags WHERE ticket_id = ? AND tag_id = ?',
      [ticketId, tagId]
    );

    sendSuccess(res, 'Tag removed from ticket successfully');
  } catch (error) {
    console.error('Remove tag from ticket error:', error);
    sendError(res, 'Failed to remove tag from ticket', error.message, 500);
  }
};

module.exports = {
  getTags,
  createTag,
  getTicketTags,
  addTagToTicket,
  removeTagFromTicket
};

