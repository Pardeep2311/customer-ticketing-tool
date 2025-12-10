const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  getSubcategory
} = require('../controllers/subcategoryController');

// Public route - anyone can view subcategories
router.get('/', getSubcategories);
router.get('/:id', getSubcategory);

module.exports = router;

