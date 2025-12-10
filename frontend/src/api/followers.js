import api from './axios';

// Get followers for a ticket
export const getTicketFollowers = async (ticketId) => {
  const response = await api.get(`/followers/ticket/${ticketId}`);
  return response.data;
};

// Check if user is following ticket
export const checkFollowing = async (ticketId) => {
  const response = await api.get(`/followers/ticket/${ticketId}/check`);
  return response.data;
};

// Add follower to ticket
export const addFollower = async (ticketId, userId = null) => {
  const response = await api.post(`/followers/ticket/${ticketId}`, { user_id: userId });
  return response.data;
};

// Remove follower from ticket
export const removeFollower = async (ticketId, userId = null) => {
  const url = userId 
    ? `/followers/ticket/${ticketId}/user/${userId}`
    : `/followers/ticket/${ticketId}`;
  const response = await api.delete(url);
  return response.data;
};

