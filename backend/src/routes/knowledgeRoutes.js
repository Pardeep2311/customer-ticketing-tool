const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  createArticle,
  getCategories,
  markHelpful,
  addFavorite,
  getFavorites
} = require('../controllers/knowledgeController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Public routes (authenticated users can view)
router.use(authenticate);

// Get all articles
router.get('/articles', getArticles);

// Get single article
router.get('/articles/:id', getArticle);

// Get categories
router.get('/categories', getCategories);

// Mark article as helpful
router.post('/articles/:id/helpful', markHelpful);

// Add to favorites
router.post('/articles/:id/favorite', addFavorite);

// Get user's favorites
router.get('/favorites', getFavorites);

// Create article (Admin/Employee only)
router.post('/articles', authorize(['admin', 'employee']), createArticle);

module.exports = router;

