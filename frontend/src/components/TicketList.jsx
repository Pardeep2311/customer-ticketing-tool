import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Clock, User, Tag, AlertCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { getTickets, updateTicket } from '../api/tickets';
import { toast } from 'sonner';
import Button from './ui/button';
import Input from './ui/input';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TicketList = ({ 
  title = 'Tickets',
  filters = {},
  showFilters = true,
  showSearch = true,
  emptyMessage = 'No tickets found'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState(filters);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchTickets();
    if (showFilters) {
      fetchEmployees();
      fetchCategories();
    }
  }, [localFilters, pagination.page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        ...localFilters,
        page: pagination.page,
        limit: pagination.limit
      };

      // Handle unassigned filter
      if (params.unassigned) {
        params.unassigned = true;
        delete params.assigned_to;
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getTickets(params);
      if (response.success) {
        let filteredTickets = response.data.tickets || [];
        
        // Client-side search
        if (searchTerm) {
          filteredTickets = filteredTickets.filter(
            (ticket) =>
              ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setTickets(filteredTickets);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || filteredTickets.length,
          pages: response.data.pagination?.pages || 1
        }));
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users?role=employee,admin');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleQuickAssign = async (ticketId, employeeId) => {
    try {
      const response = await updateTicket(ticketId, {
        assigned_to: employeeId,
        status: employeeId ? 'in_progress' : 'open',
      });

      if (response.success) {
        toast.success('Ticket assigned successfully');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">
          {pagination.total > 0 ? `${pagination.total} tickets found` : 'No tickets'}
        </p>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
          {showSearch && (
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search tickets by subject, description, ticket number, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          )}

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={localFilters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {(user?.role === 'admin' || user?.role === 'employee') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <select
                    value={localFilters.assigned_to || ''}
                    onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Assignees</option>
                    <option value="unassigned">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                    <span className="text-sm text-gray-500">#{ticket.ticket_number}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center flex-wrap gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    {ticket.category_name && (
                      <span className="flex items-center text-gray-600">
                        <Tag className="w-4 h-4 mr-1" />
                        {ticket.category_name}
                      </span>
                    )}
                    <span className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      {ticket.customer_name}
                    </span>
                    <span className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {(user?.role === 'admin' || user?.role === 'employee') && (
                  <div className="ml-4">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleQuickAssign(ticket.id, e.target.value);
                      }}
                      value={ticket.assigned_to || ''}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketList;

