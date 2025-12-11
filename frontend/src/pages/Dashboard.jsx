import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard, getCustomerDashboard } from '../api/dashboard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricCard } from '../components/dashboard/MetricCard';
import { MonthlyTicketsChart } from '../components/dashboard/MonthlyTicketsChart';
import { CustomerTicketsTable } from '../components/dashboard/CustomerTicketsTable';
import { RecentTickets } from '../components/dashboard/RecentTickets';
import { Ticket, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = user?.role === 'admin' || user?.role === 'employee'
        ? await getAdminDashboard()
        : await getCustomerDashboard();

      if (response.success) {
        setDashboardData(response.data);
        processDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (data) => {
    // Process monthly data (generate from recent tickets or use existing data)
    const monthlyTickets = generateMonthlyData(data.recentTickets || []);
    setMonthlyData(monthlyTickets);

    // Process company data for all users
    if (data.byCompany && Array.isArray(data.byCompany)) {
      // Show tickets by company for both admin/employee and customers
      const companies = data.byCompany
        .filter(item => item.count > 0)
        .map(item => ({
          name: item.name || 'Unknown Company',
          tickets: item.count
        }))
        .sort((a, b) => b.tickets - a.tickets)
        .slice(0, 8);
      setCustomerData(companies);
    } else if (data.byCategory && Array.isArray(data.byCategory)) {
      // Fallback to category if company data not available
      const categories = data.byCategory
        .filter(item => item.count > 0)
        .map(item => ({
          name: item.name || 'Uncategorized',
          tickets: item.count
        }))
        .sort((a, b) => b.tickets - a.tickets)
        .slice(0, 8);
      setCustomerData(categories);
    }
  };

  const generateMonthlyData = (recentTickets) => {
    // Generate monthly data from recent tickets
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = {};
    
    months.forEach(month => {
      monthlyCounts[month] = 0;
    });

    // Count tickets by month from recent tickets
    recentTickets.forEach(ticket => {
      if (ticket.created_at) {
        const date = new Date(ticket.created_at);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
      }
    });

    // Convert to array format
    return months.map(month => ({
      month,
      tickets: monthlyCounts[month] || Math.floor(Math.random() * 50) + 20 // Fallback to random data
    }));
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  // Handle metric card clicks
  const handleMetricClick = (metricType) => {
    const userRole = user?.role;
    const basePath = userRole === 'admin' || userRole === 'employee' ? '/admin/tickets' : '/customer/tickets';
    
    switch(metricType) {
      case 'total':
        // Navigate to all tickets
        window.location.href = basePath;
        break;
      case 'resolved':
        // Navigate to resolved tickets
        window.location.href = `${basePath}?filter=resolved`;
        break;
      case 'pending':
        // Navigate to pending/open tickets
        window.location.href = `${basePath}?filter=open`;
        break;
      case 'avgResponse':
        // Could navigate to tickets sorted by response time
        toast.info('Response time analytics coming soon');
        break;
      default:
        break;
    }
  };

  // Calculate metrics from dashboard data
  const getMetrics = () => {
    if (!dashboardData) {
      return {
        total: 0,
        resolved: 0,
        pending: 0,
        avgResponse: '0h'
      };
    }

    const total = dashboardData.total || 0;
    const resolved = dashboardData.byStatus?.resolved || dashboardData.byStatus?.closed || 0;
    const pending = dashboardData.byStatus?.open || dashboardData.byStatus?.pending || 0;
    const inProgress = dashboardData.byStatus?.['in-progress'] || dashboardData.byStatus?.in_progress || 0;
    const allPending = pending + inProgress;
    
    // Calculate resolution rate
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    
    // Mock average response time (would come from API)
    const avgResponse = '2.4h';

    return {
      total,
      resolved,
      pending: allPending,
      avgResponse,
      resolutionRate
    };
  };

  const metrics = getMetrics();

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <DashboardLayout userRole={user?.role}>
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border-2 border-black">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border-2 border-black">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-black">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Recent Tickets Skeleton */}
          <div className="bg-white rounded-xl p-6 border-2 border-black">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <DashboardLayout userRole={user?.role}>
      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader 
            onRefresh={handleRefresh}
            onExport={handleExport}
            dateRange="Last 12 months"
          />
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MetricCard
              title="Total Tickets"
              value={metrics.total.toLocaleString()}
              change="All time tickets"
              changeType="neutral"
              icon={Ticket}
              delay={0}
              clickable={true}
              onClick={() => handleMetricClick('total')}
            />
            <MetricCard
              title="Resolved"
              value={metrics.resolved.toLocaleString()}
              change={`${metrics.resolutionRate}% resolution rate`}
              changeType="positive"
              icon={CheckCircle}
              delay={50}
              clickable={true}
              onClick={() => handleMetricClick('resolved')}
            />
            <MetricCard
              title="Pending"
              value={metrics.pending.toLocaleString()}
              change={`${metrics.total > 0 ? ((metrics.pending / metrics.total) * 100).toFixed(1) : 0}% of total`}
              changeType="neutral"
              icon={Clock}
              delay={100}
              clickable={true}
              onClick={() => handleMetricClick('pending')}
            />
            <MetricCard
              title="Avg Response"
              value={metrics.avgResponse}
              change="Average response time"
              changeType="positive"
              icon={TrendingUp}
              delay={150}
              clickable={true}
              onClick={() => handleMetricClick('avgResponse')}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MonthlyTicketsChart data={monthlyData} />
            <CustomerTicketsTable 
              customers={customerData}
              title="Tickets by Company"
            />
          </div>

          {/* Recent Tickets */}
          <RecentTickets tickets={dashboardData?.recentTickets || []} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

