import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import DashboardLayout from '../components/DashboardLayout';

const MyIncidents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('MyIncidents page loaded', { 
      userId: user?.id, 
      userRole: user?.role, 
      path: window.location.pathname,
      isAdmin: user?.role === 'admin',
      isEmployee: user?.role === 'employee'
    });
    
    // Redirect if user is not admin or employee
    if (user && user.role !== 'admin' && user.role !== 'employee') {
      console.warn('MyIncidents: Access denied - redirecting. User role:', user.role);
      if (user.role === 'customer') {
        navigate('/customer/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
      return;
    }
    
    // Log successful access
    if (user && (user.role === 'admin' || user.role === 'employee')) {
      console.log('MyIncidents: Access granted for', user.role);
    }
  }, [user, navigate]);

  // Don't render if user doesn't have access
  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return null;
  }

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <TicketList
        title="My Incidents"
        filters={{
          assigned_to: user?.id
        }}
        showFilters={true}
        showSearch={true}
        emptyMessage="You don't have any assigned tickets"
      />
    </DashboardLayout>
  );
};

export default MyIncidents;

