import api from './axios';

// Get all articles
export const getArticles = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category_id) params.append('category_id', filters.category_id);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await api.get(`/knowledge/articles?${params.toString()}`);
  return response.data;
};

// Get single article
export const getArticle = async (articleId) => {
  const response = await api.get(`/knowledge/articles/${articleId}`);
  return response.data;
};

// Create article (Admin/Employee only)
export const createArticle = async (articleData) => {
  const response = await api.post('/knowledge/articles', articleData);
  return response.data;
};

// Get categories
export const getKnowledgeCategories = async () => {
  const response = await api.get('/knowledge/categories');
  return response.data;
};

// Mark article as helpful
export const markArticleHelpful = async (articleId) => {
  const response = await api.post(`/knowledge/articles/${articleId}/helpful`);
  return response.data;
};

// Add article to favorites
export const addArticleToFavorites = async (articleId) => {
  const response = await api.post(`/knowledge/articles/${articleId}/favorite`);
  return response.data;
};

// Get user's favorite articles
export const getFavoriteArticles = async () => {
  const response = await api.get('/knowledge/favorites');
  return response.data;
};

