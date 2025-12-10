const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name ASC');
    sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to retrieve categories', error.message, 500);
  }
};

// Get single category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return sendError(res, 'Category not found', null, 404);
    }
    
    sendSuccess(res, 'Category retrieved successfully', categories[0]);
  } catch (error) {
    console.error('Get category error:', error);
    sendError(res, 'Failed to retrieve category', error.message, 500);
  }
};

// Create category (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return sendError(res, 'Category name is required');
    }
    
    // Check if category already exists
    const existing = await query('SELECT id FROM categories WHERE name = ?', [name]);
    if (existing.length > 0) {
      return sendError(res, 'Category with this name already exists', null, 409);
    }
    
    const result = await query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    const newCategory = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    
    sendSuccess(res, 'Category created successfully', newCategory[0], 201);
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 'Failed to create category', error.message, 500);
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if category exists
    const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return sendError(res, 'Category not found', null, 404);
    }
    
    if (name) {
      // Check if new name conflicts
      const existing = await query('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id]);
      if (existing.length > 0) {
        return sendError(res, 'Category with this name already exists', null, 409);
      }
    }
    
    await query(
      'UPDATE categories SET name = COALESCE(?, name), description = ? WHERE id = ?',
      [name || null, description || null, id]
    );
    
    const updated = await query('SELECT * FROM categories WHERE id = ?', [id]);
    sendSuccess(res, 'Category updated successfully', updated[0]);
  } catch (error) {
    console.error('Update category error:', error);
    sendError(res, 'Failed to update category', error.message, 500);
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return sendError(res, 'Category not found', null, 404);
    }
    
    // Check if category is used in tickets
    const tickets = await query('SELECT COUNT(*) as count FROM tickets WHERE category_id = ?', [id]);
    if (tickets[0]?.count > 0) {
      return sendError(res, 'Cannot delete category that is in use', null, 400);
    }
    
    await query('DELETE FROM categories WHERE id = ?', [id]);
    sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    sendError(res, 'Failed to delete category', error.message, 500);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};

