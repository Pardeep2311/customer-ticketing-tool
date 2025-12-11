import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Don't show sidebar for unauthenticated users
  const isAuthenticated = !!user;

  const content = (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-orange-500 rounded-full p-6">
                <AlertTriangle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h2>

          <p className="text-lg text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>

          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            The page <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> could not be found. It may have been moved, deleted, or the URL might be incorrect.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </Button>
            
            {isAuthenticated ? (
              <Button
                onClick={() => navigate(user?.role === 'admin' || user?.role === 'employee' ? '/admin/dashboard' : '/customer/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Login</span>
              </Button>
            )}
          </div>

          {/* Helpful Links */}
          {isAuthenticated && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Or try these:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate('/tickets/create')}
                  className="btn-create-ticket-gradient flex items-center gap-2 text-sm"
                >
                  Create Ticket
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => navigate(user?.role === 'admin' || user?.role === 'employee' ? '/admin/tickets' : '/customer/tickets')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View Tickets
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => navigate(user?.role === 'admin' || user?.role === 'employee' ? '/admin/knowledge' : '/customer/knowledge')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Knowledge Base
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If user is authenticated, wrap in DashboardLayout, otherwise return plain content
  if (isAuthenticated) {
    return (
      <DashboardLayout userRole={user?.role || 'customer'}>
        {content}
      </DashboardLayout>
    );
  }

  return content;
};

export default NotFound;
