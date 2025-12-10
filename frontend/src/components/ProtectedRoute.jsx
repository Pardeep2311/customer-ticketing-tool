import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('Access denied:', {
      userRole: user?.role,
      allowedRoles,
      path: window.location.pathname
    });
    
    // Redirect based on user role
    if (user?.role === 'admin' || user?.role === 'employee') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  console.log('Access granted:', {
    userRole: user?.role,
    allowedRoles,
    path: window.location.pathname
  });

  return children;
};

export default ProtectedRoute;

