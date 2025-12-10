import api from './axios';

// Get all service items
export const getServiceItems = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category_id) params.append('category_id', filters.category_id);
  if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
  
  const response = await api.get(`/services/items?${params.toString()}`);
  return response.data;
};

// Get single service item
export const getServiceItem = async (itemId) => {
  const response = await api.get(`/services/items/${itemId}`);
  return response.data;
};

// Create service request
export const createServiceRequest = async (requestData) => {
  const response = await api.post('/services/requests', requestData);
  return response.data;
};

// Get my service requests
export const getMyServiceRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  
  const response = await api.get(`/services/requests/my?${params.toString()}`);
  return response.data;
};

// Get all service requests (Admin/Employee)
export const getAllServiceRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await api.get(`/services/requests?${params.toString()}`);
  return response.data;
};

// Update service request status (Admin/Employee)
export const updateServiceRequestStatus = async (requestId, status) => {
  const response = await api.put(`/services/requests/${requestId}/status`, { status });
  return response.data;
};

// Get service categories
export const getServiceCategories = async () => {
  const response = await api.get('/services/categories');
  return response.data;
};

