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

