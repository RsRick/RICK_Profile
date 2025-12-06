import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Package, LogOut, ChevronRight, ShoppingBag, Clock, CheckCircle, Loader2, HelpCircle } from 'lucide-react';
import { useShopAuth } from '../../contexts/ShopAuthContext';
import { databaseService } from '../../lib/appwrite';
import { Query } from 'appwrite';

const ORDERS_COLLECTION = 'orders';

export default function Dashboard() {
  const { customer, logout, isAuthenticated, loading: authLoading } = useShopAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/checkout');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (customer?.id) {
      loadOrders();
    }
  }, [customer]);

  const loadOrders = async () => {
    try {
      const result = await databaseService.listDocuments(
        ORDERS_COLLECTION,
        [Query.equal('customerId', customer.id), Query.orderDesc('$createdAt')]
      );
      if (result.success) {
        setOrders(result.data.documents);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'placed': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#105652]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {customer?.name || 'Customer'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-[#105652] to-[#1E8479] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">{customer?.name || 'Customer'}</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 truncate">{customer?.email}</span>
                </div>
                {customer?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{customer.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-semibold text-gray-800">{orders.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mt-4 space-y-1">
              <Link
                to="/shop"
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-[#105652]" />
                  <span className="text-sm font-medium text-gray-700">Continue Shopping</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/dashboard/support"
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-[#105652]" />
                  <span className="text-sm font-medium text-gray-700">Help & Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>


          {/* Orders Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#105652]" />
                  My Orders
                </h2>
              </div>

              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#105652]" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#105652] text-white text-sm rounded-lg hover:bg-[#0d4543]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <Link
                      key={order.$id}
                      to={`/dashboard/order/${order.$id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Order #{order.orderId?.slice(-8) || order.$id.slice(-8)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.$createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">${order.total?.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status || 'Placed'}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
