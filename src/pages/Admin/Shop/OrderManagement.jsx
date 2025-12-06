import { useState, useEffect, useRef } from 'react';
import { Package, Eye, X, Search, Filter, DollarSign, User, Mail, Phone, Clock, CheckCircle, Loader2, Save, Upload, Trash2, FileText, Send } from 'lucide-react';
import { databaseService, storageService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';
import { Query } from 'appwrite';
import { sendOrderEmail } from '../../../lib/orderEmailService';

const ORDERS_COLLECTION = 'orders';
const ORDER_FILES_BUCKET = 'order-files';

export default function OrderManagement() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    status: 'placed',
    step1Time: '',
    step1Notes: '',
    step2Time: '',
    step2Notes: '',
    step3Time: '',
    step3Notes: '',
    deliveryFiles: [], // Array of {id, name, displayName, url, uploadedAt}
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await databaseService.listDocuments(
        ORDERS_COLLECTION,
        [Query.orderDesc('$createdAt')]
      );
      if (result.success) {
        const ordersWithParsedItems = result.data.documents.map(order => {
          if (typeof order.items === 'string') {
            try {
              order.items = JSON.parse(order.items);
            } catch (e) {
              order.items = [];
            }
          }
          return order;
        });
        setOrders(ordersWithParsedItems);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    // Parse deliveryFiles if it's a string
    let files = [];
    if (order.deliveryFiles) {
      if (typeof order.deliveryFiles === 'string') {
        try {
          files = JSON.parse(order.deliveryFiles);
        } catch (e) {
          files = [];
        }
      } else {
        files = order.deliveryFiles;
      }
    }
    setEditForm({
      status: order.status || 'placed',
      step1Time: order.step1Time || '',
      step1Notes: order.step1Notes || '',
      step2Time: order.step2Time || '',
      step2Notes: order.step2Notes || '',
      step3Time: order.step3Time || '',
      step3Notes: order.step3Notes || '',
      deliveryFiles: files,
    });
    setShowModal(true);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fileId = ID.unique();
      const result = await storageService.uploadFile(ORDER_FILES_BUCKET, fileId, file);
      
      if (result.success) {
        const fileUrl = storageService.getFileView(ORDER_FILES_BUCKET, result.data.$id);
        const newFile = {
          id: result.data.$id,
          name: file.name,
          displayName: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for display
          url: fileUrl,
          uploadedAt: new Date().toISOString(),
        };
        setEditForm(prev => ({
          ...prev,
          deliveryFiles: [...prev.deliveryFiles, newFile]
        }));
        showToast('File uploaded successfully', 'success');
      } else {
        showToast('Failed to upload file', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update file display name
  const updateFileDisplayName = (fileId, newName) => {
    setEditForm(prev => ({
      ...prev,
      deliveryFiles: prev.deliveryFiles.map(f => 
        f.id === fileId ? { ...f, displayName: newName } : f
      )
    }));
  };

  // Remove file
  const removeFile = async (fileId) => {
    try {
      await storageService.deleteFile(ORDER_FILES_BUCKET, fileId);
    } catch (e) {
      console.error('Error deleting file:', e);
    }
    setEditForm(prev => ({
      ...prev,
      deliveryFiles: prev.deliveryFiles.filter(f => f.id !== fileId)
    }));
  };

  const [sendingEmail, setSendingEmail] = useState(false);

  // Send email notification based on status change
  const sendStatusEmail = async (newStatus, order, customMessage = '') => {
    setSendingEmail(true);
    try {
      const emailData = {
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        orderId: order.orderId || order.$id,
        dbOrderId: order.$id, // Database document ID for direct order link
        items: order.items,
        subtotal: order.subtotal || order.total,
        discount: order.discount || 0,
        total: order.total,
        customMessage,
        deliveryFiles: editForm.deliveryFiles,
        orderDate: order.$createdAt,
      };

      const result = await sendOrderEmail(newStatus, emailData);
      
      if (result.success) {
        showToast(`Email sent to ${order.customerEmail}`, 'success');
      } else {
        showToast('Order saved but email failed to send', 'warning');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('Order saved but email failed to send', 'warning');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSave = async (sendEmail = false) => {
    if (!selectedOrder) return;
    setSaving(true);

    try {
      // Prepare data with deliveryFiles as JSON string
      const saveData = {
        ...editForm,
        deliveryFiles: JSON.stringify(editForm.deliveryFiles)
      };

      const result = await databaseService.updateDocument(
        ORDERS_COLLECTION,
        selectedOrder.$id,
        saveData
      );

      if (result.success) {
        showToast('Order updated successfully', 'success');
        
        // Send email if requested and status changed
        if (sendEmail) {
          const customMessage = editForm.status === 'processing' ? editForm.step2Notes :
                               editForm.status === 'cancelled' ? editForm.step3Notes : '';
          await sendStatusEmail(editForm.status, selectedOrder, customMessage);
        }
        
        loadOrders();
        setShowModal(false);
      } else {
        showToast('Failed to update order', 'error');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    } finally {
      setSaving(false);
    }
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

  const getStepNumber = (status) => {
    switch (status) {
      case 'placed': return 1;
      case 'processing': return 2;
      case 'completed': return 3;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const currentStep = getStepNumber(editForm.status);


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and update status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="placed">Placed</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#105652]" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-800">
                        #{order.orderId?.slice(-8) || order.$id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{order.customerName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{order.items?.length || 0} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-800">${order.total?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status || 'placed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(order.$createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="p-2 text-[#105652] hover:bg-[#105652]/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono font-semibold">{selectedOrder.orderId || selectedOrder.$id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">PayPal Transaction</p>
                  <p className="font-mono text-sm">{selectedOrder.paypalOrderId || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customerPhone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Management */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Status Management
                </h3>

                {/* Main Status Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105652] focus:border-transparent text-base"
                  >
                    <option value="placed">1. Placed</option>
                    <option value="processing">2. Processing</option>
                    <option value="completed">3. Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Current step: {editForm.status === 'cancelled' ? 'Order Cancelled' : `Step ${currentStep} of 3`}
                  </p>
                </div>

                {/* Cancelled Notice */}
                {editForm.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 font-medium">Order will be marked as cancelled</p>
                    <p className="text-red-600 text-sm">Customer will see a cancellation notice.</p>
                  </div>
                )}

                {/* Step Fields - Only show for non-cancelled orders */}
                {editForm.status !== 'cancelled' && (
                  <div className="space-y-4">
                    {/* Step 1: Order Placed - Always visible, always completed */}
                    <div className={`rounded-lg p-4 ${currentStep >= 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {currentStep >= 1 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <h4 className={`font-medium ${currentStep >= 1 ? 'text-green-800' : 'text-gray-500'}`}>
                          Step 1: Order Placed
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3 ml-7">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Time/Date</label>
                          <input
                            type="text"
                            value={editForm.step1Time}
                            onChange={(e) => setEditForm({ ...editForm, step1Time: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="Dec 3, 3:49 PM"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Admin Notes (visible to customer)</label>
                          <textarea
                            value={editForm.step1Notes}
                            onChange={(e) => setEditForm({ ...editForm, step1Notes: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            rows={2}
                            placeholder="Order received and confirmed..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Processing - Only editable when status >= processing */}
                    <div className={`rounded-lg p-4 ${
                      currentStep >= 2 ? 'bg-green-50 border border-green-200' : 
                      currentStep === 1 ? 'bg-gray-100 border border-gray-200 opacity-60' : 
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        {currentStep >= 2 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <h4 className={`font-medium ${currentStep >= 2 ? 'text-green-800' : 'text-gray-500'}`}>
                          Step 2: Processing
                        </h4>
                        {currentStep < 2 && <span className="text-xs text-gray-400">(Select "Processing" status to edit)</span>}
                      </div>
                      {currentStep >= 2 && (
                        <div className="grid grid-cols-1 gap-3 ml-7">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Time/Date</label>
                            <input
                              type="text"
                              value={editForm.step2Time}
                              onChange={(e) => setEditForm({ ...editForm, step2Time: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              placeholder="Dec 5, 2:30 PM"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Admin Notes (visible to customer)</label>
                            <textarea
                              value={editForm.step2Notes}
                              onChange={(e) => setEditForm({ ...editForm, step2Notes: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              rows={2}
                              placeholder="Your order is being processed..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Completed - Only editable when status = completed */}
                    <div className={`rounded-lg p-4 ${
                      currentStep >= 3 ? 'bg-green-50 border border-green-200' : 
                      currentStep < 3 ? 'bg-gray-100 border border-gray-200 opacity-60' : 
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        {currentStep >= 3 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <h4 className={`font-medium ${currentStep >= 3 ? 'text-green-800' : 'text-gray-500'}`}>
                          Step 3: Completed
                        </h4>
                        {currentStep < 3 && <span className="text-xs text-gray-400">(Select "Completed" status to edit)</span>}
                      </div>
                      {currentStep >= 3 && (
                        <div className="grid grid-cols-1 gap-3 ml-7">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Time/Date</label>
                            <input
                              type="text"
                              value={editForm.step3Time}
                              onChange={(e) => setEditForm({ ...editForm, step3Time: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              placeholder="Dec 9, 10:00 AM"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Admin Notes (visible to customer)</label>
                            <textarea
                              value={editForm.step3Notes}
                              onChange={(e) => setEditForm({ ...editForm, step3Notes: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              rows={2}
                              placeholder="Order completed! Thank you..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Files Section - Only show when completed */}
                {currentStep >= 3 && editForm.status !== 'cancelled' && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Delivery Files (Customer can download these)
                    </h3>

                    {/* Upload Button */}
                    <div className="mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#105652] hover:bg-[#105652]/5 transition-colors"
                      >
                        {uploadingFile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{uploadingFile ? 'Uploading...' : 'Upload File'}</span>
                      </button>
                    </div>

                    {/* Files List */}
                    {editForm.deliveryFiles.length > 0 ? (
                      <div className="space-y-3">
                        {editForm.deliveryFiles.map((file) => (
                          <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-5 h-5 text-[#105652] flex-shrink-0" />
                            <div className="flex-1">
                              <input
                                type="text"
                                value={file.displayName}
                                onChange={(e) => updateFileDisplayName(file.id, e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#105652]"
                                placeholder="File display name"
                              />
                              <p className="text-xs text-gray-400 mt-1">
                                Original: {file.name} • Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No files uploaded yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving || sendingEmail}
                    className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Only
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || sendingEmail}
                  className="w-full px-4 py-3 bg-[#105652] text-white rounded-lg hover:bg-[#0d4543] font-medium flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Email...
                    </>
                  ) : saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Save & Send Email to Customer
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Email will notify customer about: {editForm.status === 'processing' ? 'Processing update' : 
                    editForm.status === 'cancelled' ? 'Order cancellation' : 
                    editForm.status === 'completed' ? 'Order completion & download instructions' : 'Order status'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
