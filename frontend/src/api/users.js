import api from './axios';

// Get all users (filtered by role if provided)
export const getUsers = async (role = null) => {
  const params = role ? `?role=${role}` : '';
  const response = await api.get(`/users${params}`);
  return response.data;
};

// Get single user
export const getUser = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Update own profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/me', profileData);
  return response.data;
};

// Create new user (Admin only)
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update user (Admin only)
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

