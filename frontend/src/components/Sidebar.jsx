import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Inbox, 
  Bell, 
  Ticket, 
  BookOpen, 
  Users, 
  MessageSquare, 
  FileText,
  Phone,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  BarChart3,
  FolderOpen,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  Database,
  Search,
  Calendar,
  Filter,
  Download,
  Workflow,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Archive,
  Tag,
  UserPlus,
  Mail,
  FileCheck,
  Layers,
  Network,
  Activity,
  PieChart,
  LineChart,
  Globe,
  Lock,
  Key,
  Eye,
  History,
  Star as StarIcon,
  Bookmark,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../images/logo.png';

const Sidebar = ({ userRole: propUserRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Use propUserRole if provided, otherwise use user's role from context
  // This ensures admin/employee see admin sidebar, customers see customer sidebar
  const userRole = propUserRole || user?.role || 'customer';
  
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    incidents: true,
    service: true,
    management: false,
    analytics: false,
    administration: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Auto-expand sections that contain active items
  useEffect(() => {
    navigationSections.forEach((section) => {
      const hasActiveItem = section.items.some(item => isActive(item.path));
      if (hasActiveItem && !expandedSections[section.id]) {
        setExpandedSections(prev => ({
          ...prev,
          [section.id]: true
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const isActive = (path) => {
    const [basePath, queryString] = path.split('?');
    const currentPath = location.pathname;
    const urlParams = new URLSearchParams(location.search);
    
    // First, check if the pathname matches exactly
    if (currentPath !== basePath) {
      // If current path is a child route (e.g., /admin/requests/approved is child of /admin/requests)
      // Don't highlight parent routes when on child routes
      if (currentPath.startsWith(basePath + '/')) {
        return false;
      }
      // Path doesn't match at all
      return false;
    }
    
    // Pathname matches exactly, now check query parameters
    if (queryString) {
      // This path requires specific query parameters
      const pathParams = new URLSearchParams(queryString);
      // All query parameters in the path definition must match current URL
      for (const [key, value] of pathParams.entries()) {
        if (urlParams.get(key) !== value) {
          return false;
        }
      }
      // All required query params match
      return true;
    } else {
      // Path has no query parameters defined
      // Highlight only if current URL has no query params, or only has filter=all (which is equivalent to no filter)
      const filterValue = urlParams.get('filter');
      if (location.search === '' || location.search === '?') {
        return true;
      }
      // If only filter=all is present, treat it as no filter (should highlight)
      if (urlParams.toString() === 'filter=all' && filterValue === 'all') {
        return true;
      }
      // Has other query params, don't highlight
      return false;
    }
  };

  // ServiceNow-style navigation structure
  const navigationSections = (userRole === 'admin' || userRole === 'employee')
    ? [
        {
          id: 'incidents',
          label: 'Tickets',
          icon: Ticket,
          items: [
            { icon: Inbox, label: 'All Tickets', path: '/admin/tickets', badge: null },
            { icon: Ticket, label: 'My Tickets', path: '/admin/tickets?filter=my', badge: null },
            { icon: StarIcon, label: 'Favorites', path: '/admin/tickets?filter=favorites', badge: null },
            { icon: History, label: 'Recent', path: '/admin/tickets?filter=recent', badge: null },
          ]
        },
        {
          id: 'service',
          label: 'Service Catalog',
          icon: FolderOpen,
          items: [
            { icon: PlusCircle, label: 'Create Request', path: '/tickets/create', badge: null },
            { icon: ClipboardList, label: 'My Requests', path: '/admin/requests', badge: null },
            { icon: CheckCircle, label: 'Approved', path: '/admin/requests/approved', badge: null },
            { icon: XCircle, label: 'Rejected', path: '/admin/requests/rejected', badge: null },
            { icon: Clock, label: 'Pending Approval', path: '/admin/requests/pending', badge: null },
            { icon: FileCheck, label: 'Service Items', path: '/admin/service-items', badge: null },
            { icon: Layers, label: 'Categories', path: '/admin/categories', badge: null },
          ]
        },
        {
          id: 'management',
          label: 'Management',
          icon: Settings,
          items: [
            { icon: AlertTriangle, label: 'Problem Management', path: '/admin/problems', badge: null },
            { icon: RefreshCw, label: 'Change Management', path: '/admin/changes', badge: null },
            { icon: Database, label: 'Configuration Items', path: '/admin/cmdb', badge: null },
            { icon: Network, label: 'Service Mapping', path: '/admin/service-map', badge: null },
            { icon: Shield, label: 'SLA Management', path: '/admin/sla', badge: null },
            { icon: Workflow, label: 'Workflows', path: '/admin/workflows', badge: null },
            { icon: Zap, label: 'Automation', path: '/admin/automation', badge: null },
          ]
        },
        {
          id: 'analytics',
          label: 'Reports & Analytics',
          icon: BarChart3,
          items: [
            { icon: BarChart3, label: 'Dashboards', path: '/admin/reports/dashboards', badge: null },
            { icon: PieChart, label: 'Reports', path: '/admin/reports', badge: null },
            { icon: LineChart, label: 'Analytics', path: '/admin/analytics', badge: null },
            { icon: TrendingUp, label: 'Performance', path: '/admin/reports/performance', badge: null },
            { icon: Activity, label: 'Metrics', path: '/admin/metrics', badge: null },
            { icon: Download, label: 'Exports', path: '/admin/exports', badge: null },
            { icon: Calendar, label: 'Scheduled Reports', path: '/admin/reports/scheduled', badge: null },
          ]
        },
        {
          id: 'knowledge',
          label: 'Knowledge',
          icon: BookOpen,
          items: [
            { icon: BookOpen, label: 'Knowledge Base', path: '/admin/knowledge', badge: null },
            { icon: Search, label: 'Search Articles', path: '/admin/knowledge/search', badge: null },
            { icon: FileText, label: 'My Articles', path: '/admin/knowledge/my-articles', badge: null },
            { icon: StarIcon, label: 'Favorites', path: '/admin/knowledge/favorites', badge: null },
            { icon: HelpCircle, label: 'FAQs', path: '/admin/knowledge/faqs', badge: null },
            { icon: Tag, label: 'Categories', path: '/admin/knowledge/categories', badge: null },
          ]
        },
        {
          id: 'administration',
          label: 'Administration',
          icon: Settings,
          items: [
            { icon: Users, label: 'Users & Groups', path: '/admin/users', badge: null },
            { icon: Shield, label: 'Roles & Permissions', path: '/admin/roles', badge: null },
            { icon: Settings, label: 'System Settings', path: '/admin/settings', badge: null },
            { icon: Mail, label: 'Email Configuration', path: '/admin/settings/email', badge: null },
            { icon: Key, label: 'API Keys', path: '/admin/settings/api', badge: null },
            { icon: Lock, label: 'Security', path: '/admin/settings/security', badge: null },
            { icon: Eye, label: 'Audit Logs', path: '/admin/audit-logs', badge: null },
            { icon: Globe, label: 'Integrations', path: '/admin/integrations', badge: null },
          ]
        },
        {
          id: 'communication',
          label: 'Communication',
          icon: MessageSquare,
          items: [
            { icon: Bell, label: 'Notifications', path: '/admin/notifications', badge: null },
            { icon: MessageSquare, label: 'Messages', path: '/admin/messages', badge: null },
            { icon: Phone, label: 'Chat', path: '/admin/chat', badge: null },
            { icon: Mail, label: 'Email Templates', path: '/admin/email-templates', badge: null },
          ]
        }
      ]
    : [
        {
          id: 'incidents',
          label: 'Tickets',
          icon: Ticket,
          items: [
            { icon: Inbox, label: 'All Tickets', path: '/customer/tickets', badge: null },
            { icon: StarIcon, label: 'Favorites', path: '/customer/tickets?filter=favorites', badge: null },
            { icon: History, label: 'Recent', path: '/customer/tickets?filter=recent', badge: null },
          ]
        },
        {
          id: 'service',
          label: 'Service Catalog',
          icon: FolderOpen,
          items: [
            { icon: PlusCircle, label: 'Create Ticket', path: '/tickets/create', badge: null },
            { icon: ClipboardList, label: 'My Requests', path: '/customer/requests', badge: null },
            { icon: FileCheck, label: 'Service Items', path: '/customer/service-items', badge: null },
          ]
        },
        {
          id: 'knowledge',
          label: 'Knowledge Base',
          icon: BookOpen,
          items: [
            { icon: BookOpen, label: 'Articles', path: '/customer/knowledge', badge: null },
            { icon: Search, label: 'Search', path: '/customer/knowledge/search', badge: null },
            { icon: HelpCircle, label: 'FAQs', path: '/customer/knowledge/faqs', badge: null },
            { icon: StarIcon, label: 'Favorites', path: '/customer/knowledge/favorites', badge: null },
          ]
        },
        {
          id: 'communication',
          label: 'Communication',
          icon: MessageSquare,
          items: [
            { icon: Bell, label: 'Notifications', path: '/customer/notifications', badge: null },
            { icon: MessageSquare, label: 'Messages', path: '/customer/messages', badge: null },
          ]
        }
      ];

  // Auto-expand sections that contain active items
  useEffect(() => {
    navigationSections.forEach((section) => {
      const hasActiveItem = section.items.some(item => isActive(item.path));
      if (hasActiveItem && !expandedSections[section.id]) {
        setExpandedSections(prev => ({
          ...prev,
          [section.id]: true
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  const handleLinkClick = () => {
    // If sidebar is collapsed, open it when clicking a navigation link
    if (collapsed) {
      setCollapsed(false);
    }
  };

  const handleSectionToggle = (sectionId) => {
    // If sidebar is collapsed, open it first, then toggle the section
    if (collapsed) {
      setCollapsed(false);
      // Wait a bit for the sidebar to expand before toggling section
      setTimeout(() => {
        toggleSection(sectionId);
      }, 100);
    } else {
      toggleSection(sectionId);
    }
  };

  return (
    <div
      className={`bg-gradient-sidebar border-r border-border-subtle flex flex-col h-screen transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo and Branding */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        {/* Make logo area clickable to toggle sidebar open/close */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-border-subtle">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-text-primary font-bold text-sm">Cantik</h2>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-text-secondary">
                  {userRole === 'admin'
                    ? 'Agent Admin'
                    : userRole === 'employee'
                    ? 'Agent Portal'
                    : 'Customer Portal'}
                </span>
                <ChevronDown className="w-3 h-3 text-text-secondary" />
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleCollapsed}
          className="ml-2 p-1.5 rounded hover:bg-sidebar-gradient-top text-text-secondary flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Menu with Collapsible Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={`space-y-1 ${collapsed ? 'px-1.5' : 'px-3'}`}>
          {/* Dashboard - Standalone Item */}
          <div className="mb-2">
            <Link
              to={userRole === 'admin' || userRole === 'employee' 
                ? '/admin/dashboard' 
                : '/customer/dashboard'}
              onClick={handleLinkClick}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive(userRole === 'admin' || userRole === 'employee' 
                  ? '/admin/dashboard' 
                  : '/customer/dashboard')
                  ? 'bg-gradient-primary text-text-primary shadow-button-hover'
                  : 'text-text-secondary hover:bg-sidebar-gradient-top hover:text-text-primary'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {!collapsed && <span className="text-sm">Dashboard</span>}
            </Link>
          </div>
          
          {navigationSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections[section.id];
            const hasActiveItem = section.items.some(item => isActive(item.path));

            return (
              <div key={section.id} className="mb-2">
                {/* Section Header */}
                <button
                  onClick={() => handleSectionToggle(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    hasActiveItem
                      ? 'bg-sidebar-gradient-top text-text-primary'
                      : 'text-text-secondary hover:bg-sidebar-gradient-top/50 hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-2 justify-center">
                    <SectionIcon className="w-4 h-4" />
                    {!collapsed && (
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {section.label}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && !collapsed && (
                  <div className="mt-1 ml-4 space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleLinkClick}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            active
                              ? 'bg-gradient-primary text-text-primary shadow-button-hover'
                              : 'text-text-secondary hover:bg-sidebar-gradient-top hover:text-text-primary'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <ItemIcon className="w-4 h-4" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary-accent text-text-primary rounded">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Actions Section */}
        <div className="px-3 mt-6 border-t border-border-subtle pt-4">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 mb-2">
              Quick Actions
            </h3>
          )}
          <div className="space-y-1">
            <Link
              to="/tickets/create"
              onClick={handleLinkClick}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-primary-accent hover:text-primary-light hover:bg-sidebar-gradient-top/30 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              {!collapsed && <span>Create Ticket</span>}
            </Link>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-sidebar-gradient-top/30 rounded-lg transition-colors w-full">
              <Search className="w-4 h-4" />
              {!collapsed && <span>Search</span>}
            </button>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-sidebar-gradient-top/30 rounded-lg transition-colors w-full">
              <Filter className="w-4 h-4" />
              {!collapsed && <span>Advanced Filter</span>}
            </button>
          </div>
        </div>

        {/* Pinned/Favorites Section */}
        <div className="px-3 mt-4">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Pinned
              </h3>
              <button className="text-xs text-primary-accent hover:text-primary-light">
                Manage
              </button>
            </div>
          )}
          <div className="space-y-1">
            <button className="flex items-center justify-center space-x-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors w-full">
              <Bookmark className="w-3 h-3" />
              {!collapsed && <span>Add to Pinned</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border-subtle p-4 space-y-3 bg-sidebar-bg">
        {/* Help & Support */}
        <Link
          to="/help"
          onClick={handleLinkClick}
          className="flex items-center justify-center space-x-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span>Help & Support</span>}
        </Link>

        {/* User Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-text-primary font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-primary font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-sidebar-gradient-top rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="flex items-center justify-between text-xs">
            <p className="text-text-secondary">POWERED BY</p>
            <span className="text-primary-accent font-semibold">Cantik</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

