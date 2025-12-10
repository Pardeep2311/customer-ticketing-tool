import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const CustomerFavoriteTickets = () => {
  return (
    <DashboardLayout>
      <TicketList
        title="Favorite Tickets"
        filters={{
          followed: 'true'
        }}
        showFilters={false}
        showSearch={true}
        emptyMessage="You haven't favorited any tickets yet. Click the follow button on any ticket to add it to favorites."
      />
    </DashboardLayout>
  );
};

export default CustomerFavoriteTickets;

