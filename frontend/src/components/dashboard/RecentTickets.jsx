import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Search, Filter, X } from 'lucide-react';

const statusStyles = {
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityStyles = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
};

export function RecentTickets({ tickets = [] }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Default data if none provided
  const ticketData = tickets.length > 0 ? tickets : [
    { 
      id: 1, 
      ticket_number: "TKT-1234", 
      customer_name: "Acme Corporation", 
      subject: "Login issue with SSO", 
      status: "open", 
      priority: "high", 
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() 
    },
    { 
      id: 2, 
      ticket_number: "TKT-1233", 
      customer_name: "TechStart Inc", 
      subject: "API rate limiting concerns", 
      status: "in-progress", 
      priority: "medium", 
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString() 
    },
    { 
      id: 3, 
      ticket_number: "TKT-1232", 
      customer_name: "Global Solutions", 
      subject: "Dashboard loading slowly", 
      status: "open", 
      priority: "low", 
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString() 
    },
    { 
      id: 4, 
      ticket_number: "TKT-1231", 
      customer_name: "DataFlow Systems", 
      subject: "Export feature not working", 
      status: "resolved", 
      priority: "high", 
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() 
    },
    { 
      id: 5, 
      ticket_number: "TKT-1230", 
      customer_name: "CloudNine Services", 
      subject: "Billing discrepancy", 
      status: "in-progress", 
      priority: "medium", 
      created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString() 
    },
  ];

  const handleTicketClick = (ticket) => {
    // Navigate to ticket detail page
    navigate(`/tickets/${ticket.id}`);
  };

  // Filter tickets based on search and filters
  const filteredTickets = ticketData.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      (ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      ticket.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesPriority = priorityFilter === 'all' || 
      ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div 
      className={cn(
        "bg-white rounded-xl p-6 border-2 border-black shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Animated Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50"></div>
        <svg 
          className="absolute bottom-0 left-0 w-full" 
          viewBox="0 0 1200 300" 
          preserveAspectRatio="none"
          style={{ height: '100%' }}
        >
          <defs>
            <linearGradient id="recentTicketsWave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="recentTicketsWave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,150 Q200,100 400,150 T800,150 T1200,150 L1200,300 L0,300 Z"
            fill="url(#recentTicketsWave1)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -100,0; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,180 Q250,120 500,180 T1000,180 L1200,180 L1200,300 L0,300 Z"
            fill="url(#recentTicketsWave2)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 80,0; 0,0"
              dur="15s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="space-y-3 mb-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border-2 border-black rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border-2 border-black rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <p className="text-xs text-gray-500 mb-2">
            Showing {filteredTickets.length} of {ticketData.length} tickets
          </p>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
          <div 
            key={ticket.id || ticket.ticket_number}
            onClick={() => handleTicketClick(ticket)}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-200 transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-blue-300 gap-2 sm:gap-0"
          >
            {/* Blue gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-400/15 group-hover:to-blue-500/10 transition-all duration-300"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="text-sm font-mono text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  {ticket.ticket_number || `TKT-${ticket.id}`}
                </span>
                <span 
                  className={cn(
                    "px-2 py-1 text-xs font-semibold rounded-full border",
                    statusStyles[ticket.status?.toLowerCase()] || statusStyles.open
                  )}
                >
                  {ticket.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
                </span>
                <span 
                  className={cn(
                    "px-2 py-1 text-xs font-semibold rounded-full border",
                    priorityStyles[ticket.priority?.toLowerCase()] || priorityStyles.low
                  )}
                >
                  {ticket.priority?.toUpperCase() || 'LOW'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                {ticket.subject || 'No subject'}
              </p>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                {ticket.customer_name || 'Unknown Customer'}
              </p>
            </div>
            <span className="text-xs text-gray-500 sm:ml-4 whitespace-nowrap relative z-10 group-hover:text-blue-600 transition-colors self-end sm:self-auto">
              {getTimeAgo(ticket.created_at)}
            </span>
          </div>
        ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No tickets found matching your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Clear filters to see all tickets
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

