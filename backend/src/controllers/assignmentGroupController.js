const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all assignment groups
const getAssignmentGroups = async (req, res) => {
  try {
    const { is_active } = req.query;
    let groups;
    
    if (is_active !== undefined) {
      groups = await query(
        'SELECT * FROM assignment_groups WHERE is_active = ? ORDER BY name ASC',
        [is_active === 'true' ? 1 : 0]
      );
    } else {
      groups = await query('SELECT * FROM assignment_groups ORDER BY name ASC');
    }
    
    sendSuccess(res, 'Assignment groups retrieved successfully', groups);
  } catch (error) {
    console.error('Get assignment groups error:', error);
    sendError(res, 'Failed to retrieve assignment groups', error.message, 500);
  }
};

// Get single assignment group
const getAssignmentGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await query('SELECT * FROM assignment_groups WHERE id = ?', [id]);
    
    if (groups.length === 0) {
      return sendError(res, 'Assignment group not found', null, 404);
    }
    
    sendSuccess(res, 'Assignment group retrieved successfully', groups[0]);
  } catch (error) {
    console.error('Get assignment group error:', error);
    sendError(res, 'Failed to retrieve assignment group', error.message, 500);
  }
};

// Get members of an assignment group
const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const members = await query(
      `SELECT 
        agm.id,
        agm.group_id,
        agm.user_id,
        agm.role,
        u.name,
        u.email,
        u.role as user_role
      FROM assignment_group_members agm
      INNER JOIN users u ON agm.user_id = u.id
      WHERE agm.group_id = ?
      ORDER BY agm.role DESC, u.name ASC`,
      [id]
    );
    
    sendSuccess(res, 'Group members retrieved successfully', members);
  } catch (error) {
    console.error('Get group members error:', error);
    sendError(res, 'Failed to retrieve group members', error.message, 500);
  }
};

module.exports = {
  getAssignmentGroups,
  getAssignmentGroup,
  getGroupMembers
};

