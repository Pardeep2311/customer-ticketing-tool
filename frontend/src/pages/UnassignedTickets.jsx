import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const UnassignedTickets = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <TicketList
        title="Unassigned Tickets"
        filters={{
          unassigned: true
        }}
        showFilters={true}
        showSearch={true}
        emptyMessage="All tickets are assigned! 🎉"
      />
    </DashboardLayout>
  );
};

export default UnassignedTickets;

