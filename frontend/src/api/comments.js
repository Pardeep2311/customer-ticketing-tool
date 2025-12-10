import api from './axios';

// Add comment to ticket
export const addComment = async (ticketId, commentData) => {
  const response = await api.post(`/tickets/${ticketId}/comments`, commentData);
  return response.data;
};

// Get comments for a ticket
export const getComments = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/comments`);
  return response.data;
};

// Update comment
export const updateComment = async (ticketId, commentId, commentData) => {
  const response = await api.put(`/tickets/${ticketId}/comments/${commentId}`, commentData);
  return response.data;
};

// Delete comment
export const deleteComment = async (ticketId, commentId) => {
  const response = await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
  return response.data;
};

