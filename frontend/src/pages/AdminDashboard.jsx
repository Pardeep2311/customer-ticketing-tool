import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard } from '../api/dashboard';
import { getTickets, updateTicket, deleteTicket } from '../api/tickets';
import { toast } from 'sonner';
import { Plus, Search, Filter, Calendar, Building, Columns, ChevronDown, Star, MoreVertical, Trash2, Download, FileText, X, User, Tag as TagIcon } from 'lucide-react';
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
  const [advancedFilters, setAdvancedFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    category_id: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favoriteTickets, setFavoriteTickets] = useState([]);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showBulkPriorityModal, setShowBulkPriorityModal] = useState(false);
  const [bulkAssignTo, setBulkAssignTo] = useState('');
  const [bulkPriority, setBulkPriority] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(() => {
    // Get filter from URL params, default to 'all'
    return searchParams.get('filter') || 'all';
  });

  useEffect(() => {
    fetchDashboardData();
    fetchEmployees();
    fetchCategories();
    loadFavorites();
    loadTemplates();
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
  }, [activeFilter, searchTerm, advancedFilters]);

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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const loadTemplates = () => {
    if (user?.id) {
      const templateKey = `ticket_templates_${user.id}`;
      const savedTemplates = JSON.parse(localStorage.getItem(templateKey) || '[]');
      setTemplates(savedTemplates);
    }
  };

  const saveTemplate = (template) => {
    if (!user?.id) return;
    const templateKey = `ticket_templates_${user.id}`;
    const savedTemplates = JSON.parse(localStorage.getItem(templateKey) || '[]');
    const newTemplate = {
      id: Date.now(),
      name: template.name,
      subject: template.subject,
      description: template.description,
      category_id: template.category_id,
      priority: template.priority,
      created_at: new Date().toISOString(),
    };
    savedTemplates.push(newTemplate);
    localStorage.setItem(templateKey, JSON.stringify(savedTemplates));
    setTemplates(savedTemplates);
    toast.success('Template saved successfully');
  };

  const deleteTemplate = (templateId) => {
    if (!user?.id) return;
    const templateKey = `ticket_templates_${user.id}`;
    const savedTemplates = JSON.parse(localStorage.getItem(templateKey) || '[]');
    const updated = savedTemplates.filter(t => t.id !== templateId);
    localStorage.setItem(templateKey, JSON.stringify(updated));
    setTemplates(updated);
    toast.success('Template deleted');
  };

  const applyTemplate = (template) => {
    navigate('/tickets/create', {
      state: {
        template: {
          subject: template.subject,
          description: template.description,
          category_id: template.category_id,
          priority: template.priority,
        }
      }
    });
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
      const params = { ...advancedFilters };
      
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
      
      // Apply date range filter
      if (params.dateFrom) {
        params.date_from = params.dateFrom;
        delete params.dateFrom;
      }
      if (params.dateTo) {
        params.date_to = params.dateTo;
        delete params.dateTo;
      }
      
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === false) delete params[key];
      });

      const response = await getTickets(params);
      if (response.success) {
        let filteredTickets = response.data.tickets;
        
        // Apply date range filter on frontend if backend doesn't support it
        if (advancedFilters.dateFrom || advancedFilters.dateTo) {
          filteredTickets = filteredTickets.filter(ticket => {
            const ticketDate = new Date(ticket.created_at);
            if (advancedFilters.dateFrom && ticketDate < new Date(advancedFilters.dateFrom)) return false;
            if (advancedFilters.dateTo) {
              const toDate = new Date(advancedFilters.dateTo);
              toDate.setHours(23, 59, 59, 999);
              if (ticketDate > toDate) return false;
            }
            return true;
          });
        }
        
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

  const handleBulkAssign = async () => {
    if (!bulkAssignTo || selectedTicketIds.length === 0) return;
    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedTicketIds.map((id) =>
          updateTicket(id, {
            assigned_to: bulkAssignTo,
            status: 'in_progress',
          })
        )
      );
      const assignee = employees.find(e => e.id.toString() === bulkAssignTo);
      toast.success(`Assigned ${selectedTicketIds.length} ticket(s) to ${assignee?.name || 'user'}`);
      setShowBulkAssignModal(false);
      setBulkAssignTo('');
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

  const handleBulkPriorityChange = async () => {
    if (!bulkPriority || selectedTicketIds.length === 0) return;
    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedTicketIds.map((id) =>
          updateTicket(id, {
            priority: bulkPriority,
          })
        )
      );
      toast.success(`Updated priority for ${selectedTicketIds.length} ticket(s) to ${bulkPriority}`);
      setShowBulkPriorityModal(false);
      setBulkPriority('');
      clearSelection();
      fetchTickets();
      fetchDashboardData();
    } catch (error) {
      console.error('Bulk priority change error:', error);
      toast.error('Failed to update priority');
    } finally {
      setBulkUpdating(false);
    }
  };

  const exportToCSV = () => {
    if (tickets.length === 0) {
      toast.error('No tickets to export');
      return;
    }

    try {
      const headers = ['Ticket Number', 'Subject', 'Status', 'Priority', 'Category', 'Assigned To', 'Customer', 'Created At', 'Updated At'];
      const rows = tickets.map(ticket => [
        ticket.ticket_number || '',
        (ticket.subject || '').replace(/"/g, '""'),
        ticket.status || '',
        ticket.priority || '',
        (ticket.category_name || '').replace(/"/g, '""'),
        (ticket.assigned_to_name || 'Unassigned').replace(/"/g, '""'),
        (ticket.customer_name || '').replace(/"/g, '""'),
        new Date(ticket.created_at).toLocaleString(),
        new Date(ticket.updated_at).toLocaleString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')}"`).join(','))
      ].join('\n');

      // Add BOM for UTF-8 to ensure Excel opens it correctly
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${tickets.length} ticket(s) to CSV`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const exportToPDF = () => {
    if (tickets.length === 0) {
      toast.error('No tickets to export');
      return;
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tickets Export</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
                size: A4 landscape;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              margin: 0;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .header-info {
              margin-bottom: 20px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Ticket Export Report</h1>
          <div class="header-info">
            <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Tickets:</strong> ${tickets.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Assigned To</th>
                <th>Customer</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(ticket => `
                <tr>
                  <td>${ticket.ticket_number || 'N/A'}</td>
                  <td>${(ticket.subject || '').substring(0, 50)}</td>
                  <td>${ticket.status || 'N/A'}</td>
                  <td>${ticket.priority || 'N/A'}</td>
                  <td>${ticket.category_name || 'N/A'}</td>
                  <td>${ticket.assigned_to_name || 'Unassigned'}</td>
                  <td>${ticket.customer_name || 'N/A'}</td>
                  <td>${new Date(ticket.created_at).toLocaleString()}</td>
                  <td>${new Date(ticket.updated_at).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Create a new window and write the HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          toast.success('PDF export ready. Use your browser\'s print dialog to save as PDF.');
        }, 250);
      };
    } else {
      toast.error('Please allow pop-ups to export PDF');
    }
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      status: '',
      priority: '',
      assigned_to: '',
      category_id: '',
      dateFrom: '',
      dateTo: '',
    });
    setShowAdvancedFilters(false);
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="btn-templates-gradient flex items-center gap-2 text-sm"
                title="Ticket Templates"
              >
                <FileText className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={exportToCSV}
                className="btn-export-csv-gradient flex items-center gap-2 text-sm"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="btn-export-pdf-gradient flex items-center gap-2 text-sm"
                title="Export to PDF"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => navigate('/tickets/create')}
                className="btn-create-ticket-gradient flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Ticket
              </button>
            </div>
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

        {/* Search and Advanced Filters */}
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
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 text-sm border-2 border-black rounded flex items-center gap-2 ${
                showAdvancedFilters ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(advancedFilters.status || advancedFilters.priority || advancedFilters.assigned_to || advancedFilters.category_id || advancedFilters.dateFrom || advancedFilters.dateTo) && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {[
                    advancedFilters.status,
                    advancedFilters.priority,
                    advancedFilters.assigned_to,
                    advancedFilters.category_id,
                    advancedFilters.dateFrom,
                    advancedFilters.dateTo
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
          
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 border-2 border-black rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, status: e.target.value })}
                    className="w-full border-2 border-black rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={advancedFilters.priority}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, priority: e.target.value })}
                    className="w-full border-2 border-black rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={advancedFilters.assigned_to}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, assigned_to: e.target.value })}
                    className="w-full border-2 border-black rounded px-2 py-1.5 text-sm"
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={advancedFilters.category_id}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, category_id: e.target.value })}
                    className="w-full border-2 border-black rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                    className="w-full border-2 border-black rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                    className="w-full border-2 border-black rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={clearAdvancedFilters}
                  className="px-3 py-1.5 text-sm border-2 border-black rounded hover:bg-gray-100 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          )}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleBulkAssignToMe}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-assign-gradient disabled:opacity-60 text-xs"
                  >
                    Assign to me
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkAssignModal(true)}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-assign-gradient disabled:opacity-60 text-xs flex items-center gap-1"
                  >
                    <User className="w-3 h-3" />
                    Assign to...
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkPriorityModal(true)}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-assign-gradient disabled:opacity-60 text-xs flex items-center gap-1"
                  >
                    <TagIcon className="w-3 h-3" />
                    Change Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkStatusChange('resolved')}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-resolved-gradient disabled:opacity-60 text-xs"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkStatusChange('closed')}
                    disabled={bulkUpdating}
                    className="px-2 py-1 rounded btn-closed-gradient disabled:opacity-60 text-xs"
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
                    className="px-2 py-1 rounded btn-clear-gradient disabled:opacity-60 text-xs"
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

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 border-2 border-black">
            <h3 className="text-lg font-semibold mb-4">Assign Tickets</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to:</label>
              <select
                value={bulkAssignTo}
                onChange={(e) => setBulkAssignTo(e.target.value)}
                className="w-full border-2 border-black rounded px-3 py-2"
              >
                <option value="">Select user...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBulkAssignModal(false);
                  setBulkAssignTo('');
                }}
                className="px-4 py-2 text-sm border-2 border-black rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkAssignTo || bulkUpdating}
                className="px-4 py-2 text-sm btn-submit-gradient disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Priority Modal */}
      {showBulkPriorityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 border-2 border-black">
            <h3 className="text-lg font-semibold mb-4">Change Priority</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority:</label>
              <select
                value={bulkPriority}
                onChange={(e) => setBulkPriority(e.target.value)}
                className="w-full border-2 border-black rounded px-3 py-2"
              >
                <option value="">Select priority...</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBulkPriorityModal(false);
                  setBulkPriority('');
                }}
                className="px-4 py-2 text-sm border-2 border-black rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPriorityChange}
                disabled={!bulkPriority || bulkUpdating}
                className="px-4 py-2 text-sm btn-submit-gradient disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto border-2 border-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ticket Templates</h3>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No templates saved yet. Create a ticket and save it as a template.</p>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="border-2 border-black rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2"><strong>Subject:</strong> {template.subject}</p>
                    <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> {template.description?.substring(0, 100)}...</p>
                    <button
                      onClick={() => {
                        applyTemplate(template);
                        setShowTemplatesModal(false);
                      }}
                      className="mt-2 px-3 py-1.5 text-sm btn-submit-gradient"
                    >
                      Use Template
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">To save a template, create a ticket and use the "Save as Template" option.</p>
              <button
                onClick={() => {
                  setShowTemplatesModal(false);
                  navigate('/tickets/create');
                }}
                className="px-4 py-2 text-sm btn-create-ticket-gradient"
              >
                Create New Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
