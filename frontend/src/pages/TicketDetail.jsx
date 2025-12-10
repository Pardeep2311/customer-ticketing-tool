import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Clock, User, AlertCircle, CheckCircle, XCircle, Edit2, Trash2, 
  Building, Tag, Users, Calendar, FileText, X, History as HistoryIcon, Search, 
  Unlock, Lock as LockIcon, Info, ChevronRight, ChevronUp, ChevronDown, Lock, 
  UserPlus, Filter 
} from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import { getTicket, updateTicket, deleteTicket } from '../api/tickets';
import { addComment } from '../api/comments';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getUsers } from '../api/users';
import Sidebar from '../components/Sidebar';

// Tooltip component
const Tooltip = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShow(false), 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && content && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute ${position === 'top' ? 'top-full' : 'bottom-full'} left-1/2 -translate-x-1/2 border-4 border-transparent ${position === 'top' ? 'border-t-slate-900' : 'border-b-slate-900'}`} />
        </div>
      )}
    </div>
  );
};

// Reference field with icon buttons
const ReferenceField = ({
  value,
  onChange,
  placeholder = 'Search...',
  items = [],
  displayKey = 'name',
  disabled = false,
  showLock = false,
  showInfo = true,
  showSearch = true,
  showCalendar = false,
  infoTooltip = '',
  fieldName = '',
}) => {
  const selected = items.find(i => i.id?.toString() === value) || null;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return items.slice(0, 6);
    return items
      .filter(i => (i[displayKey] || '').toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [items, query, displayKey]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.reference-dropdown') && !event.target.closest('.reference-field')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayValue = selected ? selected[displayKey] : (value ? items.find(i => i.id?.toString() === value)?.[displayKey] || value : '');

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
    toast.info(isLocked ? `${fieldName || 'Field'} unlocked` : `${fieldName || 'Field'} locked`);
  };

  return (
    <div className="relative reference-field">
      <input
        type="text"
        value={displayValue}
        readOnly
        onClick={() => !disabled && !isLocked && setOpen(true)}
        placeholder={placeholder}
        disabled={disabled || isLocked}
        className={`w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-20 px-2 py-1.5 text-sm transition-all ${
          isLocked ? 'bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-75' : ''
        } ${!disabled && !isLocked ? 'cursor-pointer hover:border-slate-400' : ''}`}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
        {showSearch && (
          <Tooltip content="Search and select">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && !isLocked) setOpen(true);
              }}
              disabled={disabled || isLocked}
            >
              <Search className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
        {showLock && (
          <Tooltip content={isLocked ? 'Unlock field' : 'Lock field'}>
            <button
              type="button"
              className={`p-1.5 rounded transition-colors ${
                isLocked
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              onClick={handleLockToggle}
            >
              {isLocked ? <LockIcon className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </Tooltip>
        )}
        {showInfo && (
          <Tooltip content={infoTooltip || `Information about ${fieldName || 'this field'}`}>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
        {showCalendar && (
          <Tooltip content="Select date">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>
      {open && !disabled && !isLocked && (
        <div className="reference-dropdown absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded shadow-lg z-20 animate-in fade-in slide-in-from-top-1">
          <div className="p-1">
            <input
              className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type to search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No results</div>
            ) : (
              filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-primary-light/10 dark:hover:bg-slate-700 text-sm transition-colors"
                  onClick={() => {
                    onChange(item.id.toString());
                    setOpen(false);
                  }}
                >
                  <span className="font-medium">{item[displayKey]}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [watchListLocked, setWatchListLocked] = useState(false);
  const [workNotesLocked, setWorkNotesLocked] = useState(false);
  const [additionalComments, setAdditionalComments] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    resolution: '',
    subject: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    assignment_group_id: '',
    location: '',
    contact_type: 'phone',
    impact: '3',
    urgency: '3',
  });

  useEffect(() => {
    fetchTicket();
    fetchUsers();
    fetchCategories();
    fetchAssignmentGroups();
    
    // Track recent ticket view
    if (id && user?.id) {
      const recentKey = `recent_tickets_${user.id}`;
      const recentTickets = JSON.parse(localStorage.getItem(recentKey) || '[]');
      const existingIndex = recentTickets.findIndex(t => t.ticketId === parseInt(id));
      
      if (existingIndex >= 0) {
        recentTickets.splice(existingIndex, 1);
      }
      
      recentTickets.unshift({
        ticketId: parseInt(id),
        viewedAt: new Date().toISOString()
      });
      
      // Keep only last 50
      const trimmed = recentTickets.slice(0, 50);
      localStorage.setItem(recentKey, JSON.stringify(trimmed));
    }
  }, [id, user]);

  const fetchTicket = async () => {
    try {
      const response = await getTicket(id);
      if (response.success) {
        const ticketData = response.data;
        setTicket(ticketData);
        setFormData({
          status: ticketData.status || '',
          priority: ticketData.priority || '',
          assigned_to: ticketData.assigned_to || '',
          resolution: ticketData.resolution || '',
          subject: ticketData.subject || '',
          description: ticketData.description || '',
          category_id: ticketData.category_id || '',
          subcategory_id: ticketData.subcategory_id || '',
          assignment_group_id: ticketData.assignment_group_id || '',
          location: ticketData.location || '',
          contact_type: ticketData.contact_type || 'phone',
          impact: ticketData.impact || '3',
          urgency: ticketData.urgency || '3',
        });
        if (ticketData.category_id) {
          fetchSubcategories(ticketData.category_id);
        }
      }
    } catch (error) {
      toast.error('Failed to load ticket');
      // Redirect based on user role
      if (user?.role === 'admin' || user?.role === 'employee') {
        navigate('/admin/tickets');
      } else {
        navigate('/customer/tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (res.success) {
        setUsers(res.data || []);
        if (user?.role === 'admin' || user?.role === 'employee') {
          setEmployees(res.data?.filter(u => u.role === 'admin' || u.role === 'employee') || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await api.get(`/subcategories?category_id=${categoryId}`);
      if (res.data?.success) {
        setSubcategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch subcategories:', err);
    }
  };

  const fetchAssignmentGroups = async () => {
    try {
      const res = await api.get('/assignment-groups');
      if (res.data?.success) {
        setAssignmentGroups(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignment groups:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await addComment(id, {
        comment: comment.trim(),
        is_internal: isInternal,
      });

      if (response.success) {
        toast.success('Comment added successfully');
        setComment('');
        setIsInternal(false);
        fetchTicket(); // Refresh ticket to get new comment
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    setSubmitting(true);
    try {
      // For customers, only send editable fields
      const updatePayload = isCustomer && canCustomerEdit
        ? {
            subject: formData.subject,
            description: formData.description,
            location: formData.location || null,
            contact_type: formData.contact_type,
          }
        : {
            status: formData.status,
            priority: formData.priority,
            assigned_to: formData.assigned_to || null,
            resolution: formData.resolution || null,
            subject: formData.subject,
            description: formData.description,
            category_id: formData.category_id || null,
            subcategory_id: formData.subcategory_id || null,
            assignment_group_id: formData.assignment_group_id || null,
            location: formData.location || null,
            contact_type: formData.contact_type,
            impact: formData.impact,
            urgency: formData.urgency,
          };

      const response = await updateTicket(id, updatePayload);
      if (response.success) {
        toast.success('Ticket updated successfully');
        setIsEditing(false);
        fetchTicket();
      }
    } catch (error) {
      toast.error('Failed to update ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAdditionalComment = async () => {
    if (!additionalComments.trim()) return;
    setSubmitting(true);
    try {
      const response = await addComment(id, {
        comment: additionalComments.trim(),
        is_internal: false,
      });
      if (response.success) {
        toast.success('Additional comment added');
        setAdditionalComments('');
        fetchTicket();
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddWorkNote = async () => {
    if (!workNotes.trim()) return;
    setSubmitting(true);
    try {
      const response = await addComment(id, {
        comment: workNotes.trim(),
        is_internal: true,
      });
      if (response.success) {
        toast.success('Work note added');
        setWorkNotes('');
        fetchTicket();
      }
    } catch (error) {
      toast.error('Failed to add work note');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
      case 'new':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-primary-light/20 text-primary-blue border-primary-mid/30';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-primary-light/20 text-primary-blue border-primary-mid/30';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleQuickAction = async (action) => {
    setSubmitting(true);
    try {
      let updatePayload = {};
      
      switch (action) {
        case 'resolve':
          updatePayload = { status: 'resolved' };
          break;
        case 'close':
          updatePayload = { status: 'closed' };
          break;
        case 'reopen':
          updatePayload = { status: 'open' };
          break;
        case 'in_progress':
          updatePayload = { status: 'in_progress' };
          break;
        default:
          return;
      }

      const response = await updateTicket(id, updatePayload);
      if (response.success) {
        toast.success(`Ticket ${action.replace('_', ' ')} successfully`);
        fetchTicket();
      }
    } catch (error) {
      toast.error(`Failed to ${action} ticket`);
    } finally {
      setSubmitting(false);
    }
  };

  const canUpdate = user?.role === 'admin' || user?.role === 'employee';
  const canDelete = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  // Customers can edit their own tickets (limited fields only)
  const canCustomerEdit = isCustomer && ticket && ticket.customer_id === user?.id;
  // Determine if user can edit (staff can edit all, customers can edit limited fields)
  const canEditTicket = canUpdate || canCustomerEdit;

  const getPriorityLabel = (p) => {
    const map = {
      '1': 'Critical',
      '2': 'High',
      '3': 'Medium',
      '4': 'Low',
      '5': 'Planning',
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return map[p] || p;
  };

  const openedDisplay = ticket ? new Date(ticket.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '') : '';

  if (loading) {
    return (
      <div className="flex h-screen bg-[#93d1ff] overflow-hidden">
        <Sidebar userRole={user?.role || 'customer'} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-mid mx-auto mb-4"></div>
            <p className="text-gray-500">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  // Format history item into human-readable text
  const formatHistoryItem = (item) => {
    if (item.action === 'comment_added') {
      try {
        if (item.new_value && item.new_value.startsWith('{')) {
          const parsed = JSON.parse(item.new_value);
          if (parsed.type === 'customer_comment' && parsed.text) {
            const text = parsed.text.length > 80 ? parsed.text.substring(0, 80) + '...' : parsed.text;
            return `Added comment: "${text}"`;
          }
        }
        return 'Comment added';
      } catch (error) {
        return 'Comment added';
      }
    }

    if (item.action === 'work_note_added') {
      try {
        if (item.new_value && item.new_value.startsWith('{')) {
          const parsed = JSON.parse(item.new_value);
          if (parsed.type === 'work_note' && parsed.text) {
            const text = parsed.text.length > 80 ? parsed.text.substring(0, 80) + '...' : parsed.text;
            return `Added work note: "${text}"`;
          }
        }
        return 'Work note added';
      } catch (error) {
        return 'Work note added';
      }
    }

    if (item.action === 'created') {
      if (item.new_value && !item.new_value.startsWith('{')) {
        return `Ticket created: ${item.new_value}`;
      }
      return 'Ticket created';
    }

    try {
      let newValue = {};
      let oldValue = {};

      if (item.new_value) {
        if (item.new_value.startsWith('{')) {
          newValue = JSON.parse(item.new_value);
        } else {
          return item.new_value;
        }
      }

      if (item.old_value && item.old_value.startsWith('{')) {
        oldValue = JSON.parse(item.old_value);
      }

      const changes = [];

      if (newValue.status && newValue.status !== oldValue.status) {
        const oldStatus = oldValue.status ? oldValue.status.replace('_', ' ').toUpperCase() : 'N/A';
        const newStatus = newValue.status.replace('_', ' ').toUpperCase();
        changes.push(`Status: ${oldStatus} → ${newStatus}`);
      }

      if (newValue.priority && newValue.priority !== oldValue.priority) {
        const oldPriority = oldValue.priority ? oldValue.priority.toUpperCase() : 'N/A';
        const newPriority = newValue.priority.toUpperCase();
        changes.push(`Priority: ${oldPriority} → ${newPriority}`);
      }

      if (newValue.assigned_to !== undefined && newValue.assigned_to !== oldValue.assigned_to) {
        if (newValue.assigned_to) {
          const assignedUser = employees.find(e => e.id.toString() === newValue.assigned_to.toString());
          changes.push(`Assigned to: ${assignedUser ? assignedUser.name : 'User #' + newValue.assigned_to}`);
        } else {
          changes.push('Unassigned');
        }
      }

      if (newValue.resolution) {
        if (!oldValue.resolution) {
          const resolutionText = newValue.resolution.length > 60 
            ? newValue.resolution.substring(0, 60) + '...' 
            : newValue.resolution;
          changes.push(`Resolution: ${resolutionText}`);
        } else if (newValue.resolution !== oldValue.resolution) {
          const resolutionText = newValue.resolution.length > 60 
            ? newValue.resolution.substring(0, 60) + '...' 
            : newValue.resolution;
          changes.push(`Resolution updated: ${resolutionText}`);
        }
      }

      if (newValue.subject && newValue.subject !== oldValue.subject) {
        changes.push(`Subject changed`);
      }

      if (newValue.description && newValue.description !== oldValue.description) {
        changes.push(`Description updated`);
      }

      if (changes.length > 0) {
        return changes.join(' • ');
      }

      return item.action.replace('_', ' ').charAt(0).toUpperCase() + item.action.replace('_', ' ').slice(1);
    } catch (error) {
      return item.action.replace('_', ' ').charAt(0).toUpperCase() + item.action.replace('_', ' ').slice(1);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      if (user?.role === 'admin' || user?.role === 'employee') {
        navigate('/admin/tickets');
      } else {
        navigate('/customer/tickets');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.ticket_number}? This action cannot be undone.`)) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await deleteTicket(id);
      if (response.success) {
        toast.success(`Ticket ${ticket.ticket_number} deleted successfully`);
        if (user?.role === 'admin' || user?.role === 'employee') {
          navigate('/admin/tickets');
        } else {
          navigate('/customer/tickets');
        }
      }
    } catch (error) {
      console.error('Delete ticket error:', error);
      toast.error('Failed to delete ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar userRole={user?.role || 'customer'} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
              <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 ml-1">
              {ticket.ticket_number} - {ticket.subject}
                  </h1>
                </div>
          <div className="flex items-center gap-2">
            {/* Update button - available for both staff and customers */}
            {canEditTicket && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-4 text-sm btn-update-gradient flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Update
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original ticket data
                        fetchTicket();
                      }}
                      className="h-8 px-4 text-sm btn-cancel-gradient flex items-center"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateTicket} 
                      disabled={submitting} 
                      className="h-8 px-4 text-sm btn-submit-gradient flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </>
            )}
            {/* Staff-only actions */}
              {canUpdate && (
                <>
                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <button
                    onClick={() => handleQuickAction('resolve')}
                    disabled={submitting || isEditing}
                    className="h-8 px-4 text-sm btn-resolve-gradient flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                  </button>
                  )}
                  {ticket.status !== 'closed' && (
                  <button
                    onClick={() => handleQuickAction('close')}
                    disabled={submitting || isEditing}
                    className="h-8 px-4 text-sm btn-close-gradient flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close
                  </button>
                  )}
                </>
              )}
              {canDelete && (
              <button
                onClick={handleDelete}
                disabled={submitting || isEditing}
                className="h-8 px-4 text-sm btn-delete-gradient flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
              )}
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* FORM SECTION */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {/* LEFT COLUMN */}
                <div className="space-y-5">
                  {/* Number */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="number">
                      Number
                    </label>
                    <div className="col-span-3">
                      <input
                        className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm font-mono font-semibold cursor-not-allowed"
                        id="number"
                        readOnly
                        type="text"
                        value={ticket.ticket_number ? `#${ticket.ticket_number}` : '#TKT...'}
                      />
          </div>
        </div>

                  {/* Caller */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="caller">
                      Caller
                    </label>
                    <div className="col-span-3">
                      <ReferenceField
                        value={ticket.customer_id?.toString() || ''}
                        onChange={(val) => setFormData({ ...formData, customer_id: val })}
                        items={users}
                        placeholder="Search..."
                        disabled={!canUpdate || !isEditing}
                        showLock={canUpdate && isEditing}
                        showInfo={true}
                        showSearch={true}
                        infoTooltip="Select the person who reported this incident"
                        fieldName="Caller"
                      />
                      {/* Show customer name for customers (read-only) */}
                      {isCustomer && !isEditing && (
                        <input
                          type="text"
                          className="w-full border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm cursor-not-allowed"
                          value={ticket.customer_name || ''}
                          readOnly
                        />
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="location">
                      Location
                    </label>
                    <div className="col-span-3 relative">
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-10 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                        id="location"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing || (isCustomer && !canCustomerEdit)}
                      >
                        <option value="">-- Select Location --</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="MP and CG">MP and CG</option>
                        <option value="ROM">ROM</option>
                        <option value="NCR">NCR</option>
                        <option value="ROI">ROI</option>
                        <option value="Bhopal">Bhopal</option>
                        <option value="Indore">Indore</option>
                        <option value="Raipur">Raipur</option>
                        <option value="Cantik">Cantik</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="category">
                      Category
                    </label>
                    <div className="col-span-3">
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="category"
                        value={formData.category_id}
                        onChange={e => {
                          setFormData({ ...formData, category_id: e.target.value });
                          if (e.target.value) fetchSubcategories(parseInt(e.target.value));
                        }}
                        disabled={!canUpdate || !isEditing}
                        title={isCustomer ? "Category cannot be changed after ticket creation" : ""}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                        </div>
                      </div>

                  {/* Subcategory */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="subcategory">
                      Subcategory
                    </label>
                    <div className="col-span-3">
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="subcategory"
                        value={formData.subcategory_id}
                        onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })}
                        disabled={!canUpdate || !isEditing || !formData.category_id}
                        title={isCustomer ? "Subcategory cannot be changed after ticket creation" : ""}
                      >
                        <option value="">-- None --</option>
                        {subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                </div>

                  {/* Impact */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="impact">
                      Impact
                    </label>
                    <div className="col-span-3">
                        <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="impact"
                        value={formData.impact}
                        onChange={e => {
                          const newImpact = e.target.value;
                          const newPriority = Math.round((Number(newImpact) + Number(formData.urgency)) / 2);
                          setFormData({ ...formData, impact: newImpact, priority: newPriority.toString() });
                        }}
                        disabled={!canUpdate || !isEditing}
                        title={isCustomer ? "Impact is set by support staff" : ""}
                      >
                        <option value="1">1 - Critical</option>
                        <option value="2">2 - High</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - Low</option>
                        </select>
                      </div>
                  </div>

                  {/* Urgency */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="urgency">
                      Urgency
                    </label>
                    <div className="col-span-3">
                        <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="urgency"
                        value={formData.urgency}
                        onChange={e => {
                          const newUrgency = e.target.value;
                          const newPriority = Math.round((Number(formData.impact) + Number(newUrgency)) / 2);
                          setFormData({ ...formData, urgency: newUrgency, priority: newPriority.toString() });
                        }}
                        disabled={!canUpdate || !isEditing}
                        title={isCustomer ? "Urgency is set by support staff" : ""}
                        >
                        <option value="1">1 - Critical</option>
                        <option value="2">2 - High</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - Low</option>
                        </select>
                      </div>
                  </div>

                  {/* Priority */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="priority">
                      Priority
                    </label>
                    <div className="col-span-3">
                        <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm cursor-not-allowed"
                        id="priority"
                        value={formData.priority}
                        disabled
                      >
                        <option value={formData.priority}>{formData.priority} - {getPriorityLabel(formData.priority)}</option>
                        </select>
                      </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-5">
                  {/* Opened */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="opened">
                      Opened
                    </label>
                    <div className="col-span-3 relative">
                      <input
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-8 px-2.5 py-1.5 text-sm font-mono"
                        id="opened"
                        type="text"
                        value={openedDisplay}
                        readOnly
                        />
                      </div>
                      </div>

                  {/* Opened by */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="opened-by">
                      Opened by
                    </label>
                    <div className="col-span-3 relative">
                      <input
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-12 px-2.5 py-1.5 text-sm"
                        id="opened-by"
                        type="text"
                        value={ticket.opened_by_name || user?.name || 'System Administrator'}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Contact type */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="contact-type">
                      Contact type
                    </label>
                    <div className="col-span-3">
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="contact-type"
                        value={formData.contact_type}
                        onChange={e => setFormData({ ...formData, contact_type: e.target.value })}
                        disabled={!isEditing || (isCustomer && !canCustomerEdit)}
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="self_service">Self-service</option>
                      </select>
                    </div>
                  </div>

                  {/* State */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="state">
                      State
                    </label>
                    <div className="col-span-3">
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="state"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        disabled={!canUpdate || !isEditing}
                        title={isCustomer ? "Status is managed by support staff" : ""}
                      >
                        <option value="new">New</option>
                        <option value="open">Open</option>
                        <option value="in_progress">Active</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                            </div>
                  </div>

                  {/* Assignment group */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="assignment-group">
                      Assignment group
                    </label>
                    <div className="col-span-3">
                      <ReferenceField
                        value={formData.assignment_group_id?.toString() || ''}
                        onChange={val => setFormData({ ...formData, assignment_group_id: val })}
                        items={assignmentGroups}
                        placeholder="Search for assignment group..."
                        displayKey="name"
                        disabled={!canUpdate || !isEditing}
                        showLock={false}
                        showInfo={true}
                        showSearch={true}
                        infoTooltip={isCustomer ? "Assignment is managed by support staff" : "Select the team that should handle this ticket"}
                        fieldName="Assignment group"
                      />
                    </div>
                  </div>

                  {/* Assigned to */}
                  <div className="grid grid-cols-4 items-center">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="assigned-to">
                      Assigned to
                    </label>
                    <div className="col-span-3">
                      <ReferenceField
                        value={formData.assigned_to?.toString() || ''}
                        onChange={val => setFormData({ ...formData, assigned_to: val })}
                        items={employees}
                        placeholder="Search..."
                        disabled={!canUpdate || !isEditing}
                        showLock={false}
                        showInfo={true}
                        showSearch={true}
                        infoTooltip={isCustomer ? "Assignment is managed by support staff" : "Assign this incident to a specific user"}
                        fieldName="Assigned to"
                      />
                      {/* Show assigned user name for customers (read-only) */}
                      {isCustomer && !isEditing && ticket.assigned_to_name && (
                        <input
                          type="text"
                          className="w-full border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm cursor-not-allowed mt-2"
                          value={`Assigned to: ${ticket.assigned_to_name}`}
                          readOnly
                        />
                                )}
                              </div>
                            </div>
                          </div>

                {/* SHORT DESCRIPTION - Full width */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-8 items-start">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-2 col-span-1" htmlFor="short-description">
                      Short description
                    </label>
                    <div className="col-span-1 md:col-span-7 relative">
                      <input
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-8 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="short-description"
                        type="text"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Enter a brief description of the issue"
                        disabled={!isEditing || (isCustomer && !canCustomerEdit)}
                      />
                        </div>
                  </div>
                  </div>

                {/* DESCRIPTION - Full width */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-8 items-start">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-2 col-span-1" htmlFor="description">
                      Description
                    </label>
                    <div className="col-span-1 md:col-span-7">
                      <textarea
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter detailed description of the issue, steps to reproduce, error messages, etc."
                        disabled={!isEditing || (isCustomer && !canCustomerEdit)}
                      />
                    </div>
                  </div>
                </div>

                {/* Resolution - Full width */}
                {ticket.resolution && (
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-8 items-start">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-2 col-span-1" htmlFor="resolution">
                        Resolution
                      </label>
                      <div className="col-span-1 md:col-span-7">
                        <textarea
                          className="w-full border border-green-300 dark:border-green-700 rounded bg-green-50 dark:bg-green-900/20 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          id="resolution"
                          rows={3}
                          value={formData.resolution || ''}
                          onChange={e => setFormData({ ...formData, resolution: e.target.value })}
                          placeholder="Enter resolution details..."
                          disabled={!canUpdate || !isEditing}
                          title={isCustomer ? "Resolution is provided by support staff" : ""}
                        />
                      </div>
                        </div>
                        </div>
                      )}
                  </form>
                </div>

            {/* NOTES SECTION */}
            <div className="p-6 bg-white dark:bg-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Notes</h2>
                <button
                  type="button"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  onClick={() => setNotesExpanded(!notesExpanded)}
                >
                  {notesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {notesExpanded && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-28 flex-shrink-0">Watch list</span>
                      <div className="flex-grow flex items-center space-x-1">
                        <Tooltip content={watchListLocked ? 'Unlock watch list' : 'Lock watch list'}>
                          <button
                            type="button"
                            className={`p-2 rounded border transition-colors ${
                              watchListLocked
                                ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                            onClick={() => {
                              setWatchListLocked(!watchListLocked);
                              toast.info(watchListLocked ? 'Watch list unlocked' : 'Watch list locked');
                            }}
                          >
                            <Lock className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Add user to watch list">
                          <button
                            type="button"
                            className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            onClick={() => toast.info('Add user to watch list')}
                          >
                            <UserPlus className="w-5 h-5" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-28 flex-shrink-0">Work notes list</span>
                      <div className="flex-grow flex items-center space-x-1">
                        <Tooltip content={workNotesLocked ? 'Unlock work notes' : 'Lock work notes'}>
                          <button
                            type="button"
                            className={`p-2 rounded border transition-colors ${
                              workNotesLocked
                                ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                            onClick={() => {
                              setWorkNotesLocked(!workNotesLocked);
                              toast.info(workNotesLocked ? 'Work notes unlocked' : 'Work notes locked');
                            }}
                          >
                            <Lock className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Add user to work notes list">
                          <button
                            type="button"
                            className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            onClick={() => toast.info('Add user to work notes list')}
                          >
                            <UserPlus className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        </div>
                      </div>
                        </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="additional-comments">
                        Additional comments (Customer visible)
                      </label>
                      <textarea
                        className="w-full border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        id="additional-comments"
                        rows={3}
                        value={additionalComments}
                        onChange={e => setAdditionalComments(e.target.value)}
                        placeholder="Comments visible to the customer"
                      />
                      <button
                        onClick={handleAddAdditionalComment}
                        disabled={submitting || !additionalComments.trim()}
                        className="mt-2 btn-submit-gradient text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Comment
                      </button>
                      </div>
                      <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="work-notes">
                        Work notes
                      </label>
                      <textarea
                        className="w-full border-amber-300 dark:border-amber-700 rounded bg-amber-50 dark:bg-amber-900/20 text-slate-900 dark:text-slate-200 focus:ring-amber-500 focus:border-amber-500 px-2.5 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 resize-none"
                        id="work-notes"
                        rows={3}
                        value={workNotes}
                        onChange={e => setWorkNotes(e.target.value)}
                        placeholder="Internal work notes (not visible to customer)"
                        disabled={!canUpdate}
                      />
                      {canUpdate && (
                        <button
                          onClick={handleAddWorkNote}
                          disabled={submitting || !workNotes.trim()}
                          className="mt-2 btn-submit-gradient text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Work Note
                        </button>
                      )}
                        </div>
                      </div>

                  {/* ACTIVITY SECTION */}
                  <div className="mt-6">
                    <div className="flex items-start">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400 w-32 flex-shrink-0 pt-2" htmlFor="activity">
                        Activity
                      </label>
                      <div className="w-full border-t border-slate-200 dark:border-slate-700 pt-2">
                        {/* Show all comments and history as activities */}
                        {ticket.comments && ticket.comments.length > 0 && ticket.comments.map((comment, idx) => (
                          <div key={`comment-${comment.id}`} className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                  {new Date(comment.created_at).toLocaleString()}
                                </span>
                                {' - '}
                                <span className="font-bold text-slate-800 dark:text-slate-100">{comment.user_name || 'System'}</span>
                                {comment.is_internal && (
                                  <span className="text-xs ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded">
                                    Internal
                                  </span>
                                )}
                        </div>
                      </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                </div>
                        ))}
                        {ticket.history && ticket.history.length > 0 && ticket.history.map((item, idx) => (
                          <div key={`history-${item.id}`} className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                                {' - '}
                                <span className="font-bold text-slate-800 dark:text-slate-100">{item.user_name || 'System'}</span>
                                <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                                  {formatHistoryItem(item)}
                                </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TicketDetail;
