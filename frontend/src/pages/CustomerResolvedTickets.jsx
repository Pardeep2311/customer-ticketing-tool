import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const CustomerResolvedTickets = () => {
  return (
    <DashboardLayout>
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

export default CustomerResolvedTickets;

