import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const CustomerOpenTickets = () => {
  return (
    <DashboardLayout>
      <TicketList
        title="Open Tickets"
        filters={{
          status: 'open'
        }}
        showFilters={true}
        showSearch={true}
        emptyMessage="No open tickets"
      />
    </DashboardLayout>
  );
};

export default CustomerOpenTickets;

