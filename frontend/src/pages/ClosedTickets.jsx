import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const ClosedTickets = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <TicketList
        title="Closed Tickets"
        filters={{
          status: 'closed'
        }}
        showFilters={true}
        showSearch={true}
        emptyMessage="No closed tickets"
      />
    </DashboardLayout>
  );
};

export default ClosedTickets;

