import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const ResolvedTickets = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <TicketList
        title="Resolved Tickets"
        filters={{
          status: 'resolved'
        }}
        showFilters={true}
        showSearch={true}
        emptyMessage="No resolved tickets"
      />
    </DashboardLayout>
  );
};

export default ResolvedTickets;

