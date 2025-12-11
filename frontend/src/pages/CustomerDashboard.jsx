import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerDashboard } from '../api/dashboard';
import { getTickets } from '../api/tickets';
import { toast } from 'sonner';
import { Plus, Ticket, Search, Filter, Calendar, Building, Columns, ChevronDown, Star, MoreVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const CustomerDashboard = () => {
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
    category_id: '',
  });
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState(() => {
    return searchParams.get('filter') || 'all';
  });
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL params with activeFilter
  useEffect(() => {
    const filterFromUrl = searchParams.get('filter') || 'all';
    if (filterFromUrl !== activeFilter) {
      setActiveFilter(filterFromUrl);
    }
  }, [searchParams]);

  const fetchDashboardData = async () => {
    try {
      const response = await getCustomerDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
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

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Clear any previous selection when loading new tickets
      setSelectedTicketIds([]);
      const params = { ...filters };
      
      // Apply active filter
      switch (activeFilter) {
        case 'open':
          params.status = 'open';
          break;
        case 'resolved':
          params.status = 'resolved';
          break;
        case 'closed':
          params.status = 'closed';
          break;
        case 'favorites':
          // Favorites will be filtered client-side from localStorage
          break;
        case 'recent':
          // Recent will be filtered client-side from localStorage
          break;
        case 'all':
        default:
          // No additional filters (backend already returns only this customer's tickets)
          break;
      }
      
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await getTickets(params);
      if (response.success) {
        let filteredTickets = response.data.tickets;
        
        // Load favorites from localStorage for this user
        const favoriteKey = `favorite_tickets_${user?.id}`;
        const storedFavoriteTickets = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
        setFavoriteIds(storedFavoriteTickets);

        // Apply favorites filter (client-side)
        if (activeFilter === 'favorites') {
          filteredTickets = filteredTickets.filter(t => storedFavoriteTickets.includes(t.id));
        }
        
        // Apply recent filter (client-side)
        if (activeFilter === 'recent') {
          const recentKey = `recent_tickets_${user?.id}`;
          const recentTickets = JSON.parse(localStorage.getItem(recentKey) || '[]');
          const recentIds = recentTickets.map(t => t.ticketId);
          filteredTickets = filteredTickets.filter(t => recentIds.includes(t.id));
        }
        
        if (searchTerm) {
          filteredTickets = filteredTickets.filter(
            (ticket) =>
              ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
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

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchTerm]);

  // Update URL when filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
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

  // Favorite helpers
  const isFavorite = (id) => favoriteIds.includes(id);

  const saveFavoriteIds = (ids) => {
    const favoriteKey = `favorite_tickets_${user?.id}`;
    localStorage.setItem(favoriteKey, JSON.stringify(ids));
    setFavoriteIds(ids);
  };

  const toggleFavorite = (ticketId) => {
    const newFavorites = favoriteIds.includes(ticketId)
      ? favoriteIds.filter((id) => id !== ticketId)
      : [...favoriteIds, ticketId];
    saveFavoriteIds(newFavorites);
    if (activeFilter === 'favorites') {
      fetchTickets();
    }
  };

  // Selection helpers
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

  const addSelectedToFavorites = () => {
    if (selectedTicketIds.length === 0) return;
    const combined = Array.from(new Set([...favoriteIds, ...selectedTicketIds]));
    saveFavoriteIds(combined);
    toast.success(`Added ${selectedTicketIds.length} ticket(s) to favorites`);
    clearSelection();
    if (activeFilter === 'favorites') {
      fetchTickets();
    }
  };

  const removeSelectedFromFavorites = () => {
    if (selectedTicketIds.length === 0) return;
    const remaining = favoriteIds.filter((id) => !selectedTicketIds.includes(id));
    saveFavoriteIds(remaining);
    toast.success(`Removed ${selectedTicketIds.length} ticket(s) from favorites`);
    clearSelection();
    if (activeFilter === 'favorites') {
      fetchTickets();
    }
  };

  return (
    <DashboardLayout userRole={user?.role || 'customer'}>
      <div className="bg-white min-h-full">
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
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => handleFilterChange('open')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === 'open'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => handleFilterChange('resolved')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === 'resolved'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => handleFilterChange('closed')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === 'closed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Closed
            </button>
            <button
              onClick={() => handleFilterChange('favorites')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === 'favorites'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => handleFilterChange('recent')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeFilter === 'recent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Recent
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
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-6 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => handleFilterChange('all')}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all text-left cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.total || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleFilterChange('open')}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all text-left cursor-pointer hover:border-yellow-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Open Tickets</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {dashboardData.byStatus?.open || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dashboardData.total > 0 
                      ? `${Math.round(((dashboardData.byStatus?.open || 0) / dashboardData.total) * 100)}% of total`
                      : 'No tickets'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleFilterChange('resolved')}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all text-left cursor-pointer hover:border-green-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Resolved Tickets</p>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardData.byStatus?.resolved || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dashboardData.total > 0 
                      ? `${Math.round(((dashboardData.byStatus?.resolved || 0) / dashboardData.total) * 100)}% resolution rate`
                      : 'No tickets'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </button>
            
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardData.byStatus?.['in-progress'] || dashboardData.byStatus?.in_progress || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Being worked on</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Bulk selection actions for customer (favorites) */}
            {selectedTicketIds.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                <span className="font-medium">
                  {selectedTicketIds.length} ticket{selectedTicketIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addSelectedToFavorites}
                    className="px-2 py-1 rounded btn-primary-gradient text-xs"
                  >
                    Add to favorites
                  </button>
                  <button
                    type="button"
                    onClick={removeSelectedFromFavorites}
                    className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-xs"
                  >
                    Remove from favorites
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs"
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
                        No tickets found. Create your first ticket!
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
                            {ticket.subject}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs text-gray-600 truncate">
                            {ticket.category_name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs text-gray-600 truncate">
                            {ticket.assigned_to_name || 'Unassigned'}
                          </span>
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
                              isFavorite(ticket.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={isFavorite(ticket.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show menu
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded hover:bg-gray-100"
                            title="More options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
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

export default CustomerDashboard;
