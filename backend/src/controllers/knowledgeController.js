const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

// Get all knowledge articles
const getArticles = async (req, res) => {
  try {
    const { category_id, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userRole = req.user.role;

    let sql = `
      SELECT ka.*, 
             kc.name as category_name,
             u.name as author_name
      FROM knowledge_articles ka
      LEFT JOIN knowledge_categories kc ON ka.category_id = kc.id
      LEFT JOIN users u ON ka.author_id = u.id
      WHERE ka.is_published = TRUE
    `;
    const params = [];

    if (category_id) {
      sql += ' AND ka.category_id = ?';
      params.push(category_id);
    }

    if (search) {
      sql += ' AND (ka.title LIKE ? OR ka.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY ka.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const articles = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM knowledge_articles WHERE is_published = TRUE';
    const countParams = [];
    if (category_id) {
      countSql += ' AND category_id = ?';
      countParams.push(category_id);
    }
    if (search) {
      countSql += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0]?.total || 0;

    sendSuccess(res, 'Articles retrieved successfully', {
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    sendError(res, 'Failed to retrieve articles', error.message, 500);
  }
};

// Get single article
const getArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const articles = await query(
      `SELECT ka.*, 
              kc.name as category_name,
              u.name as author_name
       FROM knowledge_articles ka
       LEFT JOIN knowledge_categories kc ON ka.category_id = kc.id
       LEFT JOIN users u ON ka.author_id = u.id
       WHERE ka.id = ? AND ka.is_published = TRUE`,
      [id]
    );

    if (articles.length === 0) {
      return sendError(res, 'Article not found', null, 404);
    }

    // Increment view count
    await query(
      'UPDATE knowledge_articles SET views = views + 1 WHERE id = ?',
      [id]
    );

    sendSuccess(res, 'Article retrieved successfully', articles[0]);
  } catch (error) {
    console.error('Get article error:', error);
    sendError(res, 'Failed to retrieve article', error.message, 500);
  }
};

// Create article (Admin/Employee only)
const createArticle = async (req, res) => {
  try {
    const { title, content, category_id } = req.body;
    const author_id = req.user.id;

    if (!title || !content) {
      return sendError(res, 'Title and content are required');
    }

    const result = await query(
      `INSERT INTO knowledge_articles (title, content, category_id, author_id) 
       VALUES (?, ?, ?, ?)`,
      [title, content, category_id || null, author_id]
    );

    const articles = await query(
      `SELECT ka.*, 
              kc.name as category_name,
              u.name as author_name
       FROM knowledge_articles ka
       LEFT JOIN knowledge_categories kc ON ka.category_id = kc.id
       LEFT JOIN users u ON ka.author_id = u.id
       WHERE ka.id = ?`,
      [result.insertId]
    );

    sendSuccess(res, 'Article created successfully', articles[0], 201);
  } catch (error) {
    console.error('Create article error:', error);
    sendError(res, 'Failed to create article', error.message, 500);
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await query(
      'SELECT * FROM knowledge_categories ORDER BY name ASC'
    );

    sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to retrieve categories', error.message, 500);
  }
};

// Mark article as helpful
const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE knowledge_articles SET helpful_count = helpful_count + 1 WHERE id = ?',
      [id]
    );

    sendSuccess(res, 'Article marked as helpful');
  } catch (error) {
    console.error('Mark helpful error:', error);
    sendError(res, 'Failed to mark article as helpful', error.message, 500);
  }
};

// Add to favorites
const addFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if already favorited
    const existing = await query(
      'SELECT * FROM knowledge_favorites WHERE user_id = ? AND article_id = ?',
      [user_id, id]
    );

    if (existing.length > 0) {
      return sendError(res, 'Article already in favorites');
    }

    await query(
      'INSERT INTO knowledge_favorites (user_id, article_id) VALUES (?, ?)',
      [user_id, id]
    );

    sendSuccess(res, 'Article added to favorites');
  } catch (error) {
    console.error('Add favorite error:', error);
    sendError(res, 'Failed to add to favorites', error.message, 500);
  }
};

// Get user's favorite articles
const getFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;

    const favorites = await query(
      `SELECT ka.*, 
              kc.name as category_name,
              u.name as author_name
       FROM knowledge_favorites kf
       JOIN knowledge_articles ka ON kf.article_id = ka.id
       LEFT JOIN knowledge_categories kc ON ka.category_id = kc.id
       LEFT JOIN users u ON ka.author_id = u.id
       WHERE kf.user_id = ? AND ka.is_published = TRUE
       ORDER BY kf.created_at DESC`,
      [user_id]
    );

    sendSuccess(res, 'Favorites retrieved successfully', favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    sendError(res, 'Failed to retrieve favorites', error.message, 500);
  }
};

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  getCategories,
  markHelpful,
  addFavorite,
  getFavorites
};

