import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Ticket, Percent, DollarSign, ShoppingBag, Tag, Calendar, Copy, Check } from 'lucide-react';
import { databaseService, ID } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const COUPON_COLLECTION = 'coupons';

export default function CouponManagement() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percent', // 'percent', 'fixed', 'product'
    value: '',
    applyTo: 'cart', // 'cart', 'product'
    productId: '',
    productName: '',
    minPurchase: '',
    maxUses: '',
    usedCount: 0,
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    loadCoupons();
    loadProducts();
  }, []);

  const loadCoupons = async () => {
    try {
      const result = await databaseService.listDocuments(COUPON_COLLECTION);
      if (result.success) {
        setCoupons(result.data.documents);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await databaseService.listDocuments('products');
      if (result.success) {
        setProducts(result.data.documents);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };


  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      showToast('Coupon code is required', 'error');
      return;
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      showToast('Valid discount value is required', 'error');
      return;
    }

    if (formData.type === 'percent' && parseFloat(formData.value) > 100) {
      showToast('Percentage cannot exceed 100%', 'error');
      return;
    }

    if (formData.applyTo === 'product' && !formData.productId) {
      showToast('Please select a product for product-specific coupon', 'error');
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase().trim(),
      type: formData.type,
      value: parseFloat(formData.value),
      applyTo: formData.applyTo,
      productId: formData.applyTo === 'product' ? formData.productId : '',
      productName: formData.applyTo === 'product' ? formData.productName : '',
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : 0,
      usedCount: formData.usedCount || 0,
      expiryDate: formData.expiryDate || '',
      isActive: formData.isActive,
    };

    try {
      if (editingCoupon) {
        const result = await databaseService.updateDocument(
          COUPON_COLLECTION, editingCoupon.$id, couponData
        );
        if (result.success) {
          showToast('Coupon updated successfully', 'success');
        } else {
          showToast('Failed to update coupon', 'error');
        }
      } else {
        const result = await databaseService.createDocument(
          COUPON_COLLECTION, couponData
        );
        if (result.success) {
          showToast('Coupon created successfully', 'success');
        } else {
          showToast('Failed to create coupon', 'error');
        }
      }

      setShowModal(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      showToast('Failed to save coupon', 'error');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value?.toString() || '',
      applyTo: coupon.applyTo || 'cart',
      productId: coupon.productId || '',
      productName: coupon.productName || '',
      minPurchase: coupon.minPurchase?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      usedCount: coupon.usedCount || 0,
      expiryDate: coupon.expiryDate || '',
      isActive: coupon.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;

    try {
      const result = await databaseService.deleteDocument(
        COUPON_COLLECTION, coupon.$id
      );

      if (result.success) {
        showToast('Coupon deleted successfully', 'success');
        loadCoupons();
      } else {
        showToast('Failed to delete coupon', 'error');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast('Failed to delete coupon', 'error');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      const result = await databaseService.updateDocument(
        COUPON_COLLECTION, coupon.$id, { isActive: !coupon.isActive }
      );
      if (result.success) {
        showToast(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`, 'success');
        loadCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '', type: 'percent', value: '', applyTo: 'cart',
      productId: '', productName: '', minPurchase: '', maxUses: '',
      usedCount: 0, expiryDate: '', isActive: true,
    });
    setEditingCoupon(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'percent': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'product': return <ShoppingBag className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'percent': return 'Percentage';
      case 'fixed': return 'Fixed Amount';
      case 'product': return 'Product Discount';
      default: return type;
    }
  };

  const formatValue = (coupon) => {
    if (coupon.type === 'percent') return `${coupon.value}%`;
    return `$${coupon.value?.toFixed(2)}`;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#0d4543] transition-colors">
          <Plus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be]"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div 
              key={coupon.$id} 
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                !coupon.isActive || isExpired(coupon.expiryDate) ? 'border-gray-200 opacity-60' : 'border-[#2596be]/20'
              }`}
            >
              {/* Coupon Header */}
              <div className="bg-gradient-to-r from-[#2596be] to-[#3ba8d1] p-4 text-white relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(coupon.type)}
                    <span className="text-xs uppercase tracking-wide opacity-80">{getTypeLabel(coupon.type)}</span>
                  </div>
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === coupon.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-wider">{coupon.code}</p>
                  <p className="text-3xl font-black mt-1">{formatValue(coupon)}</p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>
              </div>

              {/* Coupon Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Applies to:</span>
                  <span className="font-medium text-gray-800">
                    {coupon.applyTo === 'cart' ? 'Entire Cart' : coupon.productName || 'Specific Product'}
                  </span>
                </div>

                {coupon.minPurchase > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Min. Purchase:</span>
                    <span className="font-medium text-gray-800">${coupon.minPurchase?.toFixed(2)}</span>
                  </div>
                )}

                {coupon.maxUses > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Usage:</span>
                    <span className="font-medium text-gray-800">{coupon.usedCount || 0} / {coupon.maxUses}</span>
                  </div>
                )}

                {coupon.expiryDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expires:</span>
                    <span className={`font-medium ${isExpired(coupon.expiryDate) ? 'text-red-500' : 'text-gray-800'}`}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                      {isExpired(coupon.expiryDate) && ' (Expired)'}
                    </span>
                  </div>
                )}

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(coupon)} 
                      className="p-2 text-gray-500 hover:text-[#2596be] hover:bg-[#2596be]/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(coupon)} 
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent uppercase"
                    placeholder="SUMMER20"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'percent', label: 'Percentage', icon: Percent },
                    { value: 'fixed', label: 'Fixed Amount', icon: DollarSign },
                    { value: 'product', label: 'Product', icon: ShoppingBag },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        formData.type === value
                          ? 'border-[#2596be] bg-[#2596be]/5 text-[#2596be]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'percent' ? 'Discount Percentage *' : 'Discount Amount *'}
                </label>
                <div className="relative">
                  {formData.type === 'percent' ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.type === 'percent' ? 100 : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    placeholder={formData.type === 'percent' ? '20' : '10.00'}
                    required
                  />
                </div>
              </div>

              {/* Apply To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apply To *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, applyTo: 'cart', productId: '', productName: '' }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.applyTo === 'cart'
                        ? 'border-[#2596be] bg-[#2596be]/5 text-[#2596be]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm font-medium">Entire Cart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, applyTo: 'product' }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.applyTo === 'product'
                        ? 'border-[#2596be] bg-[#2596be]/5 text-[#2596be]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">Single Product</span>
                  </button>
                </div>
              </div>

              {/* Product Selection (if applyTo is product) */}
              {formData.applyTo === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => {
                      const product = products.find(p => p.$id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        productId: e.target.value,
                        productName: product?.name || ''
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.$id} value={product.$id}>{product.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Minimum Purchase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase (Optional)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Uses (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxUses}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2596be]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2596be]"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#2596be] text-white rounded-lg hover:bg-[#0d4543] font-medium"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

