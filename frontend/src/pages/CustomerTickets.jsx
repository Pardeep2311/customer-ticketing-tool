import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const CustomerTickets = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <TicketList
        title="My Tickets"
        filters={{}}
        showFilters={true}
        showSearch={true}
        emptyMessage="You don't have any tickets yet"
      />
    </DashboardLayout>
  );
};

export default CustomerTickets;

