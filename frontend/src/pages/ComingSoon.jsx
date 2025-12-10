import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ArrowLeft, Rocket } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/button';

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Extract page name from path
  const getPageName = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Remove admin/customer prefix if present
    if (segments[0] === 'admin' || segments[0] === 'customer') {
      segments.shift();
    }

    // Capitalize and format the page name
    const pageName = segments
      .map(segment => segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
      .join(' > ');

    return pageName || 'This Page';
  };

  return (
    <DashboardLayout userRole={user?.role || 'customer'}>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6">
                  <Clock className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Coming Soon
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              {getPageName()} is under development
            </p>

            {/* Description */}
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We're working hard to bring you this feature. It will be available soon!
            </p>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Rocket className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">In Development</span>
                <Rocket className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-sm mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              <Button
                onClick={() => navigate(user?.role === 'admin' || user?.role === 'employee' ? '/admin/dashboard' : '/customer/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            Need help? <a href="/help" className="text-blue-600 hover:text-blue-700 underline">Contact Support</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;

