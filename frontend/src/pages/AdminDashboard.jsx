import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard } from '../api/dashboard';
import { getTickets, updateTicket, deleteTicket } from '../api/tickets';
import { toast } from 'sonner';
import { Plus, Search, Filter, Calendar, Building, Columns, ChevronDown, Star, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
  });
  const [employees, setEmployees] = useState([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favoriteTickets, setFavoriteTickets] = useState([]);
  const [activeFilter, setActiveFilter] = useState(() => {
    // Get filter from URL params, default to 'all'
    return searchParams.get('filter') || 'all';
  });

  useEffect(() => {
    fetchDashboardData();
    fetchEmployees();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync URL params with activeFilter
  useEffect(() => {
    const filterFromUrl = searchParams.get('filter') || 'all';
    if (filterFromUrl !== activeFilter) {
      setActiveFilter(filterFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchTerm]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Update URL when filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await getAdminDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
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

  const loadFavorites = () => {
    if (user?.id) {
      const favoriteKey = `favorite_tickets_${user.id}`;
      const favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      setFavoriteTickets(favorites);
    }
  };

  const toggleFavorite = (ticketId) => {
    if (!user?.id) return;
    
    const favoriteKey = `favorite_tickets_${user.id}`;
    const favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
    
    let newFavorites;
    if (favorites.includes(ticketId)) {
      newFavorites = favorites.filter(id => id !== ticketId);
      toast.success('Removed from favorites');
    } else {
      newFavorites = [...favorites, ticketId];
      toast.success('Added to favorites');
    }
    
    localStorage.setItem(favoriteKey, JSON.stringify(newFavorites));
    setFavoriteTickets(newFavorites);
    
    // If we're on the favorites filter, refresh the tickets
    if (activeFilter === 'favorites') {
      fetchTickets();
    }
  };

  const isFavorite = (ticketId) => {
    return favoriteTickets.includes(ticketId);
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Clear any previous selection when loading new tickets
      setSelectedTicketIds([]);
      const params = { ...filters };
      
      // Apply active filter
      switch (activeFilter) {
        case 'my':
          params.assigned_to = user?.id;
          break;
        case 'unassigned':
          params.assigned_to = '';
          params.unassigned = true;
          break;
        case 'resolved':
          params.status = 'resolved';
          break;
        case 'closed':
          params.status = 'closed';
          break;
        case 'all':
        default:
          // No additional filters
          break;
      }
      
      if (params.assigned_to === 'unassigned') {
        params.assigned_to = '';
        params.unassigned = true;
      }
      
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === false) delete params[key];
      });

      const response = await getTickets(params);
      if (response.success) {
        let filteredTickets = response.data.tickets;
        
        if (searchTerm) {
          filteredTickets = filteredTickets.filter(
            (ticket) =>
              ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setTickets(filteredTickets);
      }
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
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
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTicketSelected = (id) => selectedTicketIds.includes(id);
  const areAllSelected = tickets.length > 0 && selectedTicketIds.length === tickets.length;

  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(tickets.map((t) => t.id));
    }
  };

  const toggleTicketSelection = (id) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedTicketIds([]);

  const handleBulkAssignToMe = async () => {
    if (!user?.id || selectedTicketIds.length === 0) return;
    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedTicketIds.map((id) =>
          updateTicket(id, {
            assigned_to: user.id,
            status: 'in_progress',
          })
        )
      );
      toast.success(`Assigned ${selectedTicketIds.length} ticket(s) to you`);
      clearSelection();
      fetchTickets();
      fetchDashboardData();
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error('Failed to assign selected tickets');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedTicketIds.length === 0) return;
    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedTicketIds.map((id) =>
          updateTicket(id, {
            status,
          })
        )
      );
      const label = status.replace('_', ' ');
      toast.success(`Updated ${selectedTicketIds.length} ticket(s) to ${label}`);
      clearSelection();
      fetchTickets();
      fetchDashboardData();
    } catch (error) {
      console.error('Bulk status change error:', error);
      toast.error('Failed to update selected tickets');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleDeleteTicket = async (ticketId, ticketNumber) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticketNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteTicket(ticketId);
      if (response.success) {
        toast.success(`Ticket ${ticketNumber} deleted successfully`);
        fetchTickets();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Delete ticket error:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTicketIds.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedTicketIds.length} ticket(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedTicketIds.map((id) => deleteTicket(id))
      );
      toast.success(`Deleted ${selectedTicketIds.length} ticket(s) successfully`);
      clearSelection();
      fetchTickets();
      fetchDashboardData();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete selected tickets');
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <div className="min-h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardData?.total || 0} {dashboardData?.total === 1 ? 'Ticket' : 'Tickets'}
              </p>
            </div>
            <button
              onClick={() => navigate('/tickets/create')}
              className="btn-create-ticket-gradient flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => handleFilterChange('my')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
                activeFilter === 'my'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => handleFilterChange('unassigned')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
                activeFilter === 'unassigned'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              Unassigned
            </button>
            <button
              onClick={() => handleFilterChange('resolved')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
                activeFilter === 'resolved'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => handleFilterChange('closed')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
                activeFilter === 'closed'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Bulk actions bar */}
            {selectedTicketIds.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                <span className="font-medium">
                  {selectedTicketIds.length} ticket{selectedTicketIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkAssignToMe}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-primary-gradient disabled:opacity-60 text-xs"
                  >
                    Assign to me
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkStatusChange('resolved')}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-primary-gradient disabled:opacity-60 text-xs"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkStatusChange('closed')}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-dashboard-gradient disabled:opacity-60 text-xs"
                  >
                    Mark Closed
                  </button>
                  {(user?.role === 'admin') && (
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={bulkUpdating}
                      className="px-2 py-1 rounded btn-delete-gradient disabled:opacity-60 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-60 text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-10 px-2 py-2 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-3.5 h-3.5 cursor-pointer"
                        checked={areAllSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Number
                    </th>
                    <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Opened
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Short Description
                    </th>
                    <th className="w-24 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      State
                    </th>
                    <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Assigned To
                    </th>
                    <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                      Updated
                    </th>
                    <th className="w-10 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                    </th>
                    <th className="w-10 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-6 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-sm">Loading tickets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-6 text-center text-gray-500 text-sm">
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <td className="px-2 py-2">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 w-3.5 h-3.5 cursor-pointer"
                            checked={isTicketSelected(ticket.id)}
                            onChange={() => toggleTicketSelection(ticket.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs font-semibold text-gray-900">
                            {ticket.ticket_number || 'N/A'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-[10px] text-gray-600">
                            <div className="whitespace-nowrap">
                              {new Date(ticket.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="whitespace-nowrap text-gray-500">
                              {new Date(ticket.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-xs font-medium text-gray-900 truncate" title={ticket.subject}>
                            {ticket.subject || 'No subject'}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs text-gray-600 truncate">
                            {ticket.category_name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          {ticket.assigned_to_name ? (
                            <span className="text-xs text-gray-600 truncate">
                              {ticket.assigned_to_name}
                            </span>
                          ) : (
                            <select
                              value=""
                              onChange={(e) => handleQuickAssign(ticket.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] px-1.5 py-1 bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                            >
                              <option value="">Unassigned</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-[10px] text-gray-600">
                            <div className="whitespace-nowrap">
                              {new Date(ticket.updated_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="whitespace-nowrap text-gray-500">
                              {new Date(ticket.updated_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(ticket.id);
                            }}
                            className={`transition-colors p-0.5 rounded hover:bg-yellow-50 ${
                              isFavorite(ticket.id)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={isFavorite(ticket.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFavorite(ticket.id) ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="px-2 py-2 text-center relative">
                          {(user?.role === 'admin') && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === ticket.id ? null : ticket.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded hover:bg-gray-100"
                                title="More options"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                              {openMenuId === ticket.id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTicket(ticket.id, ticket.ticket_number);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
