import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const RecentTickets = () => {
  const { user } = useAuth();
  const [recentTicketIds, setRecentTicketIds] = useState([]);

  useEffect(() => {
    // Get recent tickets from localStorage
    const recentTickets = JSON.parse(localStorage.getItem(`recent_tickets_${user?.id}`) || '[]');
    // Get last 20 most recent
    const recentIds = recentTickets.slice(0, 20).map(t => t.ticketId);
    setRecentTicketIds(recentIds);
  }, [user]);

  if (recentTicketIds.length === 0) {
    return (
      <DashboardLayout userRole={user?.role || 'admin'}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Recent Tickets</h1>
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800 mt-6">
            <p className="text-gray-400 text-lg">No recently viewed tickets</p>
            <p className="text-gray-500 text-sm mt-2">
              Tickets you view will appear here
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <TicketList
        title="Recent Tickets"
        filters={{
          ticket_ids: recentTicketIds.join(',')
        }}
        showFilters={false}
        showSearch={true}
        emptyMessage="No recently viewed tickets"
      />
    </DashboardLayout>
  );
};

export default RecentTickets;

