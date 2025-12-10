import api from './axios';

// Create new ticket
export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

// Get all tickets (filtered by user role)
export const getTickets = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category_id) params.append('category_id', filters.category_id);
  if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
  if (filters.unassigned) params.append('unassigned', 'true');
  if (filters.followed) params.append('followed', filters.followed);
  if (filters.ticket_ids) params.append('ticket_ids', filters.ticket_ids);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await api.get(`/tickets?${params.toString()}`);
  return response.data;
};

// Get single ticket
export const getTicket = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

// Update ticket
export const updateTicket = async (ticketId, ticketData) => {
  const response = await api.put(`/tickets/${ticketId}`, ticketData);
  return response.data;
};

// Delete ticket (admin only)
export const deleteTicket = async (ticketId) => {
  const response = await api.delete(`/tickets/${ticketId}`);
  return response.data;
};

// Get next ticket number (preview)
export const getNextTicketNumber = async () => {
  const response = await api.get('/tickets/next-number');
  return response.data;
};

