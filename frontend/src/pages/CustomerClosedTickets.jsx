import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const CustomerClosedTickets = () => {
  return (
    <DashboardLayout>
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

export default CustomerClosedTickets;

