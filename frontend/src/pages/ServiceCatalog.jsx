import { useState, useEffect } from 'react';
import { PlusCircle, ClipboardList, CheckCircle, XCircle, Clock, FileCheck } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getServiceItems, getMyServiceRequests } from '../api/services';
import { toast } from 'sonner';

const ServiceCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceItems, setServiceItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'requests'

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchServiceItems();
    } else {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchServiceItems = async () => {
    try {
      setLoading(true);
      const response = await getServiceItems({ is_active: true });
      if (response.success) {
        setServiceItems(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch service items:', error);
      toast.error('Failed to load service items');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyServiceRequests();
      if (response.success) {
        setMyRequests(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/10';
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <DashboardLayout userRole={user?.role}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Service Catalog</h1>
            <p className="text-gray-400">Browse and request available services</p>
          </div>
          <Button onClick={() => navigate('/tickets/create')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Request
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-5 h-5 inline mr-2" />
            Service Catalog
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'requests'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-5 h-5 inline mr-2" />
            My Requests
          </button>
        </div>

        {/* Service Catalog Tab */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : serviceItems.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No service items available</p>
              </div>
            ) : (
              serviceItems.map((service) => (
              <div
                key={service.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">{service.name}</h3>
                  {service.requires_approval && (
                    <span className="px-2 py-1 text-xs bg-yellow-400/10 text-yellow-400 rounded">
                      Requires Approval
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{service.category_name || 'Uncategorized'}</span>
                  <span>⏱ {service.estimated_time || 'N/A'}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/tickets/create', { state: { serviceId: service.id } });
                  }}
                >
                  Request Service
                </Button>
              </div>
              ))
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">My Service Requests</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No service requests yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab('catalog')}
                  >
                    Browse Services
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <div key={request.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{request.service_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                          {request.status === 'approved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                          {request.status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                          {request.status}
                        </span>
                      </div>
                      {request.description && (
                        <p className="text-gray-400 text-sm mb-2">{request.description}</p>
                      )}
                      <p className="text-gray-400 text-sm">Requested on: {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ServiceCatalog;

