import api from './axios';

// Get customer dashboard data
export const getCustomerDashboard = async () => {
  const response = await api.get('/dashboard/customer');
  return response.data;
};

// Get admin dashboard data
export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

 