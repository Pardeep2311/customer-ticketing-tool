import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Menu,
  Lightbulb,
  Search,
  Unlock,
  Lock as LockIcon,
  Info,
  Calendar,
  ChevronRight,
  ChevronUp,
  Lock,
  UserPlus,
  X,
  Filter,
  ChevronDown,
  BookOpen,
  XCircle,
} from 'lucide-react';

import Button from '../components/ui/button';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { createTicket, getNextTicketNumber } from '../api/tickets';
import { getUsers } from '../api/users';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

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

// Knowledge Base Suggestions Modal
const KBSuggestionsModal = ({ isOpen, onClose, searchTerm }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (isOpen && searchTerm) {
      // Simulate KB search - replace with actual API call
      const mockSuggestions = [
        { id: 1, title: 'How to troubleshoot CPU issues', relevance: 95 },
        { id: 2, title: 'Common performance problems', relevance: 87 },
        { id: 3, title: 'System monitoring best practices', relevance: 72 },
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Knowledge Base Suggestions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Relevance: {item.relevance}%
                      </p>
                    </div>
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No suggestions found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
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
        className={`w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-20 px-2 py-1.5 text-sm transition-all ${
          isLocked ? 'bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-75' : ''
        } ${!disabled && !isLocked ? 'cursor-pointer hover:border-black' : ''}`}
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
        <div className="reference-dropdown absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border-2 border-black rounded shadow-lg z-20 animate-in fade-in slide-in-from-top-1">
          <div className="p-1">
            <input
              className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm transition-colors"
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

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [watchListLocked, setWatchListLocked] = useState(false);
  const [workNotesLocked, setWorkNotesLocked] = useState(false);
  const [previewTicketNumber, setPreviewTicketNumber] = useState('');
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategoryName, setCustomSubcategoryName] = useState('');
  const openedAt = new Date();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category_id: '',
    subcategory: '',
    location: '',
    contact_type: 'phone',
    state: 'new',
    impact: '3',
    urgency: '3',
    priority: '3',
    assignment_group: '',
    assigned_to: '',
    requester_id: '',
    additional_comments: '',
    work_notes: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchUsers();
    fetchAssignmentGroups();
    fetchNextTicketNumber();
    if (user) {
      setForm(f => ({ ...f, requester_id: user.id?.toString() || '' }));
    }
  }, [user]);

  const fetchNextTicketNumber = async () => {
    try {
      const response = await getNextTicketNumber();
      if (response.success && response.data?.ticket_number) {
        setPreviewTicketNumber(response.data.ticket_number);
      } else {
        setPreviewTicketNumber('');
      }
    } catch (error) {
      console.error('Failed to fetch next ticket number:', error);
      setPreviewTicketNumber('');
    }
  };

  useEffect(() => {
    const p = Math.round((Number(form.impact) + Number(form.urgency)) / 2);
    setForm(f => ({ ...f, priority: p.toString() }));
  }, [form.impact, form.urgency]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        const allCategories = res.data.data || [];
        // Filter to only show "Technical Support" or find it
        const techSupport = allCategories.find(c => 
          c.name.toLowerCase().includes('technical') || 
          c.name.toLowerCase().includes('support')
        );
        
        if (techSupport) {
          setCategories([techSupport]);
          // Auto-select Technical Support category
          setForm(f => ({ ...f, category_id: techSupport.id.toString() }));
          // Fetch subcategories for this category
          fetchSubcategories(techSupport.id);
        } else {
          setCategories(allCategories);
        }
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchSubcategories = async (categoryId) => {
    // Default electronic device subcategories (fallback)
    const deviceSubcategories = [
      { id: 1, name: 'Installation Issues', category_id: categoryId },
      { id: 2, name: 'WiFi/Network Connectivity', category_id: categoryId },
      { id: 3, name: 'System Issues', category_id: categoryId },
      { id: 4, name: 'Hardware Problems', category_id: categoryId },
      { id: 5, name: 'Software Issues', category_id: categoryId },
      { id: 6, name: 'Driver Problems', category_id: categoryId },
      { id: 7, name: 'Performance Issues', category_id: categoryId },
      { id: 8, name: 'Configuration Problems', category_id: categoryId },
    ];

    try {
      const res = await api.get(`/subcategories?category_id=${categoryId}`);
      if (res.data?.success) {
        const apiSubs = res.data.data || [];
        // If API returns no subcategories, fall back to device-specific ones
        setSubcategories(apiSubs.length > 0 ? apiSubs : deviceSubcategories);
      } else {
        // If success flag is false, also fall back
        setSubcategories(deviceSubcategories);
      }
    } catch (err) {
      // If API doesn't exist or fails, use hardcoded subcategories
      setSubcategories(deviceSubcategories);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (res.success) setUsers(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const fetchAssignmentGroups = async () => {
    try {
      const res = await api.get('/assignment-groups');
      if (res.data?.success) {
        setAssignmentGroups(res.data.data || []);
      }
    } catch (err) {
      // If API doesn't exist yet, use hardcoded assignment groups
      const mockGroups = [
        { id: 1, name: 'IT Support Team' },
        { id: 2, name: 'Hardware Team' },
        { id: 3, name: 'Network Team' },
        { id: 4, name: 'Software Team' },
        { id: 5, name: 'Help Desk' },
      ];
      setAssignmentGroups(mockGroups);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    
    // When category changes, fetch subcategories
    if (key === 'category_id' && value) {
      fetchSubcategories(parseInt(value));
      // Clear subcategory when category changes
      setForm(prev => ({ ...prev, subcategory: '' }));
      setShowCustomSubcategory(false);
      setCustomSubcategoryName('');
    }
    
    // Handle subcategory selection
    if (key === 'subcategory') {
      if (value === 'custom') {
        setShowCustomSubcategory(true);
        setForm(prev => ({ ...prev, subcategory: '' }));
      } else {
        setShowCustomSubcategory(false);
        setCustomSubcategoryName('');
      }
    }
  };
  
  const handleCustomSubcategoryChange = (value) => {
    setCustomSubcategoryName(value);
    // Store custom subcategory name in form (we'll handle this in submit)
    setForm(prev => ({ ...prev, subcategory: value || '' }));
  };

  const getPriorityLabel = (p) => {
    const map = {
      '1': 'Critical',
      '2': 'High',
      '3': 'Medium',
      '4': 'Low',
      '5': 'Planning'
    };
    return map[p] || p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill short description & description");
      return;
    }
    if (!form.requester_id) {
      toast.error("Please select a caller");
      return;
    }

    setLoading(true);
    try {
      const res = await createTicket({
        subject: form.subject,
        description: form.description,
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
        subcategory_id: showCustomSubcategory ? null : (form.subcategory && form.subcategory.trim() && !isNaN(parseInt(form.subcategory, 10)) ? parseInt(form.subcategory, 10) : null),
        subcategory_name: showCustomSubcategory && customSubcategoryName.trim() ? customSubcategoryName.trim() : null,
        priority: form.priority,
        assignment_group_id: form.assignment_group && form.assignment_group.trim() ? parseInt(form.assignment_group, 10) : null,
        assigned_to:
          (user?.role === "admin" || user?.role === "employee") && form.assigned_to && form.assigned_to.trim()
            ? parseInt(form.assigned_to, 10)
            : null,
        requester_id: form.requester_id && form.requester_id.trim() ? parseInt(form.requester_id, 10) : null,
        additional_comments: form.additional_comments || "",
        work_notes: form.work_notes || "",
      });

      if (res.success) {
        toast.success("Ticket created", { description: `Ticket #${res.data.ticket_number}` });
        navigate(
          user?.role === "admin" || user?.role === "employee"
            ? "/admin/dashboard"
            : "/customer/dashboard"
        );
      }
    } catch (err) {
      toast.error("Failed to create ticket");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const openedDisplay = openedAt.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '');

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* SIDEBAR - Let Sidebar handle its own collapse */}
      <Sidebar userRole={user?.role || 'customer'} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 ml-1">Create New Ticket</h1>
          </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 text-sm btn-cancel-gradient" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="h-8 px-4 text-sm btn-submit-gradient" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          {/* FORM SECTION */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/40 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 relative overflow-hidden form-pattern-bg">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* LEFT COLUMN */}
              <div className="space-y-5">
                {/* Number */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="number">
                    Number
                  </label>
                  <div className="col-span-3">
                    <input
                      className="w-full bg-slate-100 dark:bg-slate-700 border-2 border-black rounded text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm font-mono font-semibold cursor-not-allowed"
                      id="number"
                      readOnly
                      type="text"
                      value={previewTicketNumber ? `#${previewTicketNumber}` : '#TKT...'}
                      placeholder="Auto-generated ticket number"
                      title="Ticket number is automatically generated and will increment for each new ticket"
                    />
                  </div>
                </div>

                {/* Caller */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="caller">
                    Caller <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-3">
                    <ReferenceField
                      value={form.requester_id}
                      onChange={val => handleChange('requester_id', val)}
                      items={users}
                      placeholder="Search..."
                      showLock={true}
                      showInfo={true}
                      showSearch={true}
                      infoTooltip="Select the person who reported this incident"
                      fieldName="Caller"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="location">
                    Location
                  </label>
                  <div className="col-span-3 relative">
                    <select
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-10 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none cursor-pointer"
                      id="location"
                      value={form.location}
                      onChange={e => handleChange('location', e.target.value)}
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
                      <Tooltip content="Location information">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors pointer-events-auto"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </Tooltip>
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
                      className="w-full border-2 border-black rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm cursor-not-allowed"
                      id="category"
                      value={form.category_id}
                      disabled
                      title="Category is set to Technical Support for electronic device issues"
                    >
                      {categories.length > 0 ? (
                        categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      ) : (
                        <option value="">Technical Support</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Subcategory */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="subcategory">
                    Subcategory
                  </label>
                  <div className="col-span-3 space-y-2">
                    {!showCustomSubcategory ? (
                      <select
                        className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        id="subcategory"
                        value={form.subcategory}
                        onChange={e => handleChange('subcategory', e.target.value)}
                      >
                        <option value="">-- None --</option>
                        {subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                        <option value="custom">+ Add Custom Subcategory</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="Enter custom subcategory name"
                          value={customSubcategoryName}
                          onChange={e => handleCustomSubcategoryChange(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomSubcategory(false);
                            setCustomSubcategoryName('');
                            setForm(prev => ({ ...prev, subcategory: '' }));
                          }}
                          className="px-3 py-1.5 text-sm border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Impact */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="impact">
                    Impact
                  </label>
                  <div className="col-span-3">
                    <select
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      id="impact"
                      value={form.impact}
                      onChange={e => handleChange('impact', e.target.value)}
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
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      id="urgency"
                      value={form.urgency}
                      onChange={e => handleChange('urgency', e.target.value)}
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
                      className="w-full border-2 border-black rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm cursor-not-allowed"
                      id="priority"
                      value={form.priority}
                      disabled
                    >
                      <option value={form.priority}>{form.priority} - {getPriorityLabel(form.priority)}</option>
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
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-8 px-2.5 py-1.5 text-sm font-mono"
                      id="opened"
                      type="text"
                      value={openedDisplay}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Tooltip content="Select date and time">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Opened by */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="opened-by">
                    Opened by
                  </label>
                  <div className="col-span-3 relative">
                    <input
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-12 px-2.5 py-1.5 text-sm"
                      id="opened-by"
                      type="text"
                      value={user?.name || 'System Administrator'}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Tooltip content="Search for user">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="User information">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Contact type */}
                <div className="grid grid-cols-4 items-center">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 col-span-1" htmlFor="contact-type">
                    Contact type
                  </label>
                  <div className="col-span-3">
                    <select
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      id="contact-type"
                      value={form.contact_type}
                      onChange={e => handleChange('contact_type', e.target.value)}
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
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      id="state"
                      value={form.state}
                      onChange={e => handleChange('state', e.target.value)}
                    >
                      <option value="new">New</option>
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
                      value={form.assignment_group}
                      onChange={val => handleChange('assignment_group', val)}
                      items={assignmentGroups}
                      placeholder="Search for assignment group..."
                      displayKey="name"
                      disabled={!(user?.role === 'admin' || user?.role === 'employee')}
                      showLock={false}
                      showInfo={true}
                      showSearch={true}
                      infoTooltip="Select the team that should handle this ticket"
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
                      value={form.assigned_to}
                      onChange={val => handleChange('assigned_to', val)}
                      items={users.filter(u => u.role === 'admin' || u.role === 'employee')}
                      placeholder="Search..."
                      disabled={!(user?.role === 'admin' || user?.role === 'employee')}
                      showLock={false}
                      showInfo={true}
                      showSearch={true}
                      infoTooltip="Assign this incident to a specific user"
                      fieldName="Assigned to"
                    />
                  </div>
                </div>
              </div>

              {/* SHORT DESCRIPTION - Full width */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-8 items-start">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-2 col-span-1" htmlFor="short-description">
                    Short description <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-1 md:col-span-7 relative">
                    <input
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 pr-8 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      id="short-description"
                      type="text"
                      value={form.subject}
                      onChange={e => handleChange('subject', e.target.value)}
                      placeholder="Enter a brief description of the issue"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Tooltip content="Knowledge Base suggestions">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors"
                          onClick={() => setKbModalOpen(true)}
                        >
                          <Lightbulb className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION - Full width */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-8 items-start">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-2 col-span-1" htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-1 md:col-span-7">
                    <textarea
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                      id="description"
                      rows={4}
                      value={form.description}
                      onChange={e => handleChange('description', e.target.value)}
                      placeholder="Enter detailed description of the issue, steps to reproduce, error messages, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Related Search Results */}
              {form.subject && (
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-8">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 md:col-span-7">
                      <button
                        type="button"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        onClick={() => setKbModalOpen(true)}
                      >
                        Related Search Results
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* NOTES SECTION */}
          <div className="p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/40 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 relative overflow-hidden form-pattern-bg">
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
                              : 'border-2 border-black bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
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
                          className="p-2 rounded border-2 border-black bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
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
                              : 'border-2 border-black bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
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
                          className="p-2 rounded border-2 border-black bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
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
                      className="w-full border-2 border-black rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 px-2.5 py-1.5 text-sm transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                      id="additional-comments"
                      rows={3}
                      value={form.additional_comments}
                      onChange={e => handleChange('additional_comments', e.target.value)}
                      placeholder="Comments visible to the customer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="work-notes">
                      Work notes
                    </label>
                    <textarea
                      className="w-full border-amber-300 dark:border-amber-700 rounded bg-amber-50 dark:bg-amber-900/20 text-slate-900 dark:text-slate-200 focus:ring-amber-500 focus:border-amber-500 px-2.5 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 resize-none"
                      id="work-notes"
                      rows={3}
                      value={form.work_notes}
                      onChange={e => handleChange('work_notes', e.target.value)}
                      placeholder="Internal work notes (not visible to customer)"
                    />
                  </div>
                </div>

                {/* ACTIVITY SECTION */}
                <div className="mt-6">
                  <div className="flex items-start">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 w-32 flex-shrink-0 pt-2" htmlFor="activity">
                      Activity
                    </label>
                    <div className="w-full border-t border-slate-200 dark:border-slate-700 pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{openedDisplay}</span>
                          {' - '}
                          <span className="font-bold text-slate-800 dark:text-slate-100">{user?.name || 'System Administrator'}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                            Changed: Assigned to, Additional comments, Impact, Incident state, Opened by, Priority
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tooltip content="Remove activity">
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Filter activities">
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                              <Filter className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Expand/Collapse">
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-300">Assigned to: (Empty)</p>
                        <p className="text-sm mt-2 text-blue-600 dark:text-blue-400 font-medium">
                          {form.subject || 'CPU Utilization for 1 is 19.409%, crossed warning ( ) or critical (0) threshold.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Modal */}
      <KBSuggestionsModal
        isOpen={kbModalOpen}
        onClose={() => setKbModalOpen(false)}
        searchTerm={form.subject}
      />
    </div>
  );
}
