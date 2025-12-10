import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const PendingTickets = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <TicketList
        title="Pending Tickets"
        filters={{
          status: 'pending'
        }}
        showFilters={true}
        showSearch={true}
        emptyMessage="No pending tickets"
      />
    </DashboardLayout>
  );
};

export default PendingTickets;

