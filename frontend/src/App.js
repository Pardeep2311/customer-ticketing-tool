import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import KnowledgeBase from './pages/KnowledgeBase';
import ServiceCatalog from './pages/ServiceCatalog';
import Notifications from './pages/Notifications';
import MyIncidents from './pages/MyIncidents';
import UnassignedTickets from './pages/UnassignedTickets';
import PendingTickets from './pages/PendingTickets';
import ResolvedTickets from './pages/ResolvedTickets';
import ClosedTickets from './pages/ClosedTickets';
import FavoriteTickets from './pages/FavoriteTickets';
import RecentTickets from './pages/RecentTickets';
import CustomerTickets from './pages/CustomerTickets';
import CustomerOpenTickets from './pages/CustomerOpenTickets';
import CustomerResolvedTickets from './pages/CustomerResolvedTickets';
import CustomerClosedTickets from './pages/CustomerClosedTickets';
import CustomerFavoriteTickets from './pages/CustomerFavoriteTickets';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard/old"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/old"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/create"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'employee']}>
                <CreateTicket />
              </ProtectedRoute>
            }
          />

          {/* Incident Management Routes (Admin/Employee) - Must come before /tickets/:id */}
          <Route
            path="/admin/tickets/my"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MyIncidents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/unassigned"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <UnassignedTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/pending"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <PendingTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/resolved"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ResolvedTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/closed"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ClosedTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/favorites"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <FavoriteTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/recent"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <RecentTickets />
              </ProtectedRoute>
            }
          />

          {/* Customer Ticket Routes - Must come before /tickets/:id */}
          <Route
            path="/customer/tickets"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/tickets/open"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerOpenTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/tickets/resolved"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerResolvedTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/tickets/closed"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerClosedTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/tickets/favorites"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerFavoriteTickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'employee']}>
                <TicketDetail />
              </ProtectedRoute>
            }
          />

          {/* Knowledge Base Routes */}
          <Route
            path="/customer/knowledge"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'employee']}>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/knowledge"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />

          {/* Service Catalog Routes */}
          <Route
            path="/customer/service-items"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'employee']}>
                <ServiceCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/service-items"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />

          {/* Service Request Routes - Coming Soon */}
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests/approved"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests/rejected"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests/pending"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />

          {/* Categories Route - Coming Soon */}
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />

          {/* Notifications Routes */}
          <Route
            path="/customer/notifications"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'employee']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Notifications />
              </ProtectedRoute>
            }
          />


          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

