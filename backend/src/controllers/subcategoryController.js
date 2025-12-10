const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all subcategories (optionally filtered by category_id)
const getSubcategories = async (req, res) => {
  try {
    const { category_id } = req.query;
    let subcategories;
    
    if (category_id) {
      subcategories = await query(
        'SELECT * FROM subcategories WHERE category_id = ? ORDER BY name ASC',
        [category_id]
      );
    } else {
      subcategories = await query('SELECT * FROM subcategories ORDER BY category_id, name ASC');
    }
    
    sendSuccess(res, 'Subcategories retrieved successfully', subcategories);
  } catch (error) {
    console.error('Get subcategories error:', error);
    sendError(res, 'Failed to retrieve subcategories', error.message, 500);
  }
};

// Get single subcategory
const getSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategories = await query('SELECT * FROM subcategories WHERE id = ?', [id]);
    
    if (subcategories.length === 0) {
      return sendError(res, 'Subcategory not found', null, 404);
    }
    
    sendSuccess(res, 'Subcategory retrieved successfully', subcategories[0]);
  } catch (error) {
    console.error('Get subcategory error:', error);
    sendError(res, 'Failed to retrieve subcategory', error.message, 500);
  }
};

module.exports = {
  getSubcategories,
  getSubcategory
};

