import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, ShoppingBag, XCircle, MessageSquare, Lock, Download, Eye } from 'lucide-react';
import { useShopAuth } from '../../contexts/ShopAuthContext';
import { databaseService } from '../../lib/appwrite';
import { generateDownloadToken, secureDownload, secureView } from '../../lib/secureDownload';
import styled from 'styled-components';

const ORDERS_COLLECTION = 'orders';

export default function OrderStatus() {
  const { orderId } = useParams();
  const { isAuthenticated, loading: authLoading, customer } = useShopAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/checkout');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const result = await databaseService.getDocument(ORDERS_COLLECTION, orderId);
      if (result.success) {
        const orderData = result.data;
        // Parse items
        if (typeof orderData.items === 'string') {
          try {
            orderData.items = JSON.parse(orderData.items);
          } catch (e) {
            orderData.items = [];
          }
        }
        // Parse deliveryFiles
        if (typeof orderData.deliveryFiles === 'string') {
          try {
            orderData.deliveryFiles = JSON.parse(orderData.deliveryFiles);
          } catch (e) {
            orderData.deliveryFiles = [];
          }
        }
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get step number from status: placed=1, processing=2, completed=3
  const getStepNumber = (status) => {
    switch (status) {
      case 'placed': return 1;
      case 'processing': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  // Secure download handler
  const handleSecureDownload = async (file) => {
    if (!customer) {
      setDownloadError('Please log in to download files.');
      return;
    }

    // Verify order belongs to current user
    if (order.customerEmail?.toLowerCase() !== customer.email?.toLowerCase()) {
      setDownloadError('You are not authorized to download files from this order.');
      return;
    }

    setDownloadingFile(file.id);
    setDownloadError(null);

    try {
      // Generate secure token
      const token = generateDownloadToken(
        file.id,
        orderId,
        customer.email,
        customer.id
      );

      // Perform secure download
      const result = await secureDownload(token, file.url, file.name);

      if (!result.success) {
        setDownloadError(result.error);
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError('Failed to download file. Please try again.');
    } finally {
      setDownloadingFile(null);
    }
  };

  // Secure view handler (opens in new tab after validation)
  const handleSecureView = async (file) => {
    if (!customer) {
      setDownloadError('Please log in to view files.');
      return;
    }

    // Verify order belongs to current user
    if (order.customerEmail?.toLowerCase() !== customer.email?.toLowerCase()) {
      setDownloadError('You are not authorized to view files from this order.');
      return;
    }

    setDownloadingFile(file.id);
    setDownloadError(null);

    try {
      // Generate secure token
      const token = generateDownloadToken(
        file.id,
        orderId,
        customer.email,
        customer.id
      );

      // Use secure view function
      const result = await secureView(token, file.url);

      if (!result.success) {
        setDownloadError(result.error);
      }
    } catch (error) {
      console.error('View error:', error);
      setDownloadError('Failed to view file. Please try again.');
    } finally {
      setDownloadingFile(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#105652]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link to="/dashboard" className="text-[#105652] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepNumber(order.status);
  const isCancelled = order.status === 'cancelled';

  // Build steps array with data from database
  const steps = [
    {
      number: 1,
      title: 'Order Placed',
      time: order.step1Time || new Date(order.$createdAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
      }),
      notes: order.step1Notes || '',
      isCompleted: currentStep >= 1,
      isActive: currentStep === 1,
    },
    {
      number: 2,
      title: 'Processing',
      time: order.step2Time || '',
      notes: order.step2Notes || '',
      isCompleted: currentStep >= 2,
      isActive: currentStep === 2,
    },
    {
      number: 3,
      title: 'Completed',
      time: order.step3Time || '',
      notes: order.step3Notes || '',
      isCompleted: currentStep >= 3,
      isActive: currentStep === 3,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Order Status</h1>
            <p className="text-sm text-gray-500">#{order.orderId?.slice(-8) || order.$id.slice(-8)}</p>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Order Summary</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
              order.status === 'completed' ? 'bg-green-100 text-green-700' :
              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.status || 'Placed'}
            </span>
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800">${order.subtotal?.toFixed(2) || order.total?.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm mb-2 text-green-600">
                <span>Discount</span>
                <span>-${order.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span className="text-gray-800">Total</span>
              <span className="text-[#105652]">${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>


        {/* Cancelled Order Notice */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800 text-lg">Order Cancelled</p>
                <p className="text-sm text-red-600">This order has been cancelled. Please contact support if you have questions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Stepper - Only show if not cancelled */}
        {!isCancelled && (
          <StepperWrapper>
            <div className="stepper-box">
              {steps.map((step, index) => (
                <div 
                  key={step.number} 
                  className={`stepper-step ${
                    step.isCompleted ? 'stepper-completed' : 
                    step.isActive ? 'stepper-active' : 
                    'stepper-pending'
                  }`}
                >
                  <div className="stepper-circle">
                    {step.isCompleted ? (
                      <svg viewBox="0 0 16 16" fill="currentColor" height={16} width={16}>
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && <div className="stepper-line" />}
                  <div className="stepper-content">
                    <div className="stepper-title">{step.title}</div>
                    <div className="stepper-status">
                      {step.isCompleted ? 'Completed' : step.isActive ? 'In Progress' : 'Pending'}
                    </div>
                    {step.time && <div className="stepper-time">{step.time}</div>}
                    {step.notes && (
                      <div className="stepper-notes">
                        <MessageSquare className="w-3 h-3" />
                        <span>{step.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </StepperWrapper>
        )}

        {/* Delivery Files Section - Only show when completed and has files */}
        {currentStep >= 3 && !isCancelled && order.deliveryFiles && order.deliveryFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#105652]" />
              <h3 className="text-lg font-semibold text-gray-800">Your Files</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Secure</span>
            </div>
            
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">
                <Lock className="w-3 h-3 inline mr-1" />
                Files are protected. Downloads only work when you're logged in with your account.
              </p>
            </div>

            {/* Download Error */}
            {downloadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{downloadError}</p>
              </div>
            )}

            <div className="space-y-3">
              {order.deliveryFiles.map((file) => (
                <FileCard key={file.id}>
                  <div className="card">
                    <div className="container">
                      <div className="left">
                        <div className="status-ind" />
                      </div>
                      <div className="right">
                        <div className="text-wrap">
                          <p className="text-content">
                            <span className="text-link">Portfolio of Parvej</span> invited you to Download{' '}
                            <span className="text-link">"{file.displayName || file.name}"</span> file.
                          </p>
                          <p className="time">{formatTimeAgo(file.uploadedAt)}</p>
                        </div>
                        <div className="button-wrap">
                          <button 
                            onClick={() => handleSecureView(file)}
                            disabled={downloadingFile === file.id}
                            className="primary-cta"
                          >
                            {downloadingFile === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                            ) : (
                              <Eye className="w-4 h-4 inline mr-1" />
                            )}
                            View file
                          </button>
                          <button 
                            onClick={() => handleSecureDownload(file)}
                            disabled={downloadingFile === file.id}
                            className="secondary-cta"
                          >
                            {downloadingFile === file.id ? (
                              <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                            ) : (
                              <Download className="w-4 h-4 inline mr-1" />
                            )}
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </FileCard>
              ))}
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[#105652] hover:underline text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

const StepperWrapper = styled.div`
  .stepper-box {
    background-color: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
  }

  .stepper-step {
    display: flex;
    margin-bottom: 32px;
    position: relative;
  }

  .stepper-step:last-child {
    margin-bottom: 0;
  }

  .stepper-line {
    position: absolute;
    left: 19px;
    top: 40px;
    bottom: -32px;
    width: 2px;
    background-color: #e2e8f0;
    z-index: 1;
  }

  .stepper-completed .stepper-line {
    background-color: #105652;
  }

  .stepper-step:last-child .stepper-line {
    display: none;
  }

  .stepper-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    z-index: 2;
    font-weight: 600;
    flex-shrink: 0;
  }

  .stepper-completed .stepper-circle {
    background-color: #105652;
    color: white;
  }

  .stepper-active .stepper-circle {
    border: 2px solid #105652;
    color: #105652;
    background: white;
  }

  .stepper-pending .stepper-circle {
    border: 2px solid #e2e8f0;
    color: #94a3b8;
    background: white;
  }

  .stepper-content {
    flex: 1;
    padding-top: 2px;
  }

  .stepper-title {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 15px;
  }

  .stepper-completed .stepper-title {
    color: #105652;
  }

  .stepper-active .stepper-title {
    color: #0f172a;
  }

  .stepper-pending .stepper-title {
    color: #94a3b8;
  }

  .stepper-status {
    font-size: 13px;
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    margin-top: 4px;
  }

  .stepper-completed .stepper-status {
    background-color: #dcfce7;
    color: #166534;
  }

  .stepper-active .stepper-status {
    background-color: #dbeafe;
    color: #1d4ed8;
  }

  .stepper-pending .stepper-status {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .stepper-time {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 6px;
  }

  .stepper-notes {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f8fafc;
    border-radius: 8px;
    font-size: 12px;
    color: #64748b;
    border-left: 3px solid #105652;
  }

  .stepper-notes svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const FileCard = styled.div`
  .card {
    width: 100%;
    background-color: #f2f3f7;
    border-radius: 0.75em;
    cursor: pointer;
    transition: ease 0.2s;
    box-shadow: 1em 1em 1em #d8dae0b1, -0.75em -0.75em 1em #ffffff;
    border: 1.5px solid #f2f3f7;
  }

  .card:hover {
    background-color: #d3ddf1;
    border: 1.5px solid #105652;
  }

  .container {
    margin-top: 1.25em;
    margin-bottom: 1.375em;
    margin-left: 1.375em;
    margin-right: 2em;
    display: flex;
    flex-direction: row;
    gap: 0.75em;
  }

  .status-ind {
    width: 0.625em;
    height: 0.625em;
    background-color: #105652;
    margin: 0.375em 0;
    border-radius: 0.5em;
  }

  .text-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    color: #333;
  }

  .time {
    font-size: 0.875em;
    color: #777;
  }

  .text-link {
    font-weight: 500;
    color: #105652;
  }

  .text-content {
    font-size: 14px;
    line-height: 1.5;
  }

  .button-wrap {
    display: flex;
    flex-direction: row;
    gap: 1em;
    align-items: center;
    margin-top: 0.5em;
  }

  .secondary-cta {
    background-color: transparent;
    border: none;
    font-size: 15px;
    font-weight: 400;
    color: #666;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .secondary-cta:hover:not(:disabled) {
    background-color: #f1f5f9;
    color: #333;
  }

  .secondary-cta:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .primary-cta {
    font-size: 15px;
    background-color: transparent;
    font-weight: 600;
    color: #105652;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    transition: all 0.2s;
  }

  .primary-cta:hover:not(:disabled) {
    background-color: #105652;
    color: white;
  }

  .primary-cta:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .right {
    display: flex;
    flex-direction: column;
    gap: 0.875em;
    flex: 1;
  }
`;
