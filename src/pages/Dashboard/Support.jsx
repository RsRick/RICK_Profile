import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, HelpCircle, FileQuestion, CheckCircle, Loader2, Clock, Package, ChevronDown } from 'lucide-react';
import { useShopAuth } from '../../contexts/ShopAuthContext';
import { databaseService } from '../../lib/appwrite';
import { Query } from 'appwrite';

const CONTACT_RESPONSES_COLLECTION = 'contact_responses';
const ORDERS_COLLECTION = 'orders';

export default function Support() {
  const { customer, isAuthenticated, loading: authLoading } = useShopAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    relatedOrderId: '' // For order dropdown
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/checkout');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Pre-fill form with customer data
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || ''
      }));
      loadOrders();
    }
  }, [customer]);

  // Load customer orders for dropdown
  const loadOrders = async () => {
    if (!customer?.id) return;
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
      setLoadingOrders(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Find selected order details if any
      const selectedOrder = orders.find(o => o.$id === formData.relatedOrderId);
      const orderRef = selectedOrder 
        ? `Order #${selectedOrder.orderId?.slice(-8) || selectedOrder.$id.slice(-8)} ($${selectedOrder.total?.toFixed(2)})`
        : '';

      // Add order reference to subject if order selected
      const subjectWithOrder = orderRef 
        ? `${formData.subject} [${orderRef}]`
        : formData.subject;

      const result = await databaseService.createDocument(
        CONTACT_RESPONSES_COLLECTION,
        {
          name: formData.name,
          email: formData.email,
          phone: customer?.phone || '', // Use customer phone if available
          subject: subjectWithOrder,
          message: formData.message,
          isRead: false
        }
      );

      if (result.success) {
        setSubmitSuccess(true);
        setFormData(prev => ({ ...prev, subject: '', message: '', relatedOrderId: '' }));
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2596be]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Help & Support</h1>
            <p className="text-sm text-gray-500">We're here to help you</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Help Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Support Info Card */}
            <div className="bg-gradient-to-br from-[#2596be] to-[#3ba8d1] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="80" cy="20" r="40" fill="white" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Our support team is ready to assist you with any questions or issues.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-white/70" />
                    <span className="text-white/90">Response within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-[#2596be]" />
                Common Topics
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Order Issues', value: 'Issue with my order' },
                  { label: 'Download Problems', value: 'Cannot download files' },
                  { label: 'Payment Questions', value: 'Payment inquiry' },
                  { label: 'Refund Request', value: 'Refund request' },
                  { label: 'General Question', value: 'General question' },
                ].map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData(prev => ({ ...prev, subject: topic.value }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.subject === topic.value 
                        ? 'bg-[#2596be] text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#2596be] to-[#3ba8d1] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Send a Message</h2>
                    <p className="text-white/80 text-sm">Fill out the form and we'll get back to you</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6">
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">Message sent successfully!</p>
                      <p className="text-green-600 text-xs">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {/* Pre-filled Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sending as</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2596be] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{customer?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{customer?.name || 'Customer'}</p>
                      <p className="text-sm text-gray-500">{customer?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What can we help you with?"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2596be] outline-none transition-all"
                  />
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Please describe your issue or question in detail..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2596be] outline-none transition-all resize-none"
                  />
                </div>

                {/* Optional: Related Order Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Order <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      name="relatedOrderId"
                      value={formData.relatedOrderId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2596be] outline-none transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="">No specific order</option>
                      {loadingOrders ? (
                        <option disabled>Loading orders...</option>
                      ) : orders.length === 0 ? (
                        <option disabled>No orders found</option>
                      ) : (
                        orders.map((order) => (
                          <option key={order.$id} value={order.$id}>
                            #{order.orderId?.slice(-8) || order.$id.slice(-8)} - ${order.total?.toFixed(2)} ({order.status || 'placed'})
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {loadingOrders ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {formData.relatedOrderId && (
                    <p className="text-xs text-[#2596be] mt-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Order reference will be included in your message
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#2596be] to-[#3ba8d1] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#2596be]/20 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


