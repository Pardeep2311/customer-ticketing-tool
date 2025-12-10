import api from './axios';

// Get all tags
export const getTags = async () => {
  const response = await api.get('/tags');
  return response.data;
};

// Create tag (Admin only)
export const createTag = async (tagData) => {
  const response = await api.post('/tags', tagData);
  return response.data;
};

// Get tags for a ticket
export const getTicketTags = async (ticketId) => {
  const response = await api.get(`/tags/ticket/${ticketId}`);
  return response.data;
};

// Add tag to ticket
export const addTagToTicket = async (ticketId, tagData) => {
  const response = await api.post(`/tags/ticket/${ticketId}`, tagData);
  return response.data;
};

// Remove tag from ticket
export const removeTagFromTicket = async (ticketId, tagId) => {
  const response = await api.delete(`/tags/ticket/${ticketId}/${tagId}`);
  return response.data;
};

