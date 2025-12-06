import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart, Sparkles, Ticket, X, Check, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { 
    cart, 
    cartSubtotal,
    cartTotal, 
    cartCount, 
    removeFromCart, 
    updateQuantity,
    appliedCoupon,
    discount,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
  } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);

  // Auto-apply coupon when pasting
  useEffect(() => {
    const handlePaste = async (e) => {
      // Only handle paste in coupon input
      if (document.activeElement?.id !== 'coupon-input') return;
      
      const pastedText = e.clipboardData?.getData('text')?.trim();
      if (pastedText && pastedText.length >= 4 && pastedText.length <= 20) {
        setCouponCode(pastedText.toUpperCase());
        // Auto-apply after a short delay
        setTimeout(async () => {
          const success = await applyCoupon(pastedText);
          if (success) {
            setShowCouponSuccess(true);
            setTimeout(() => setShowCouponSuccess(false), 3000);
          }
        }, 100);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [applyCoupon]);

  const handleApplyCoupon = async () => {
    const success = await applyCoupon(couponCode);
    if (success) {
      setShowCouponSuccess(true);
      setTimeout(() => setShowCouponSuccess(false), 3000);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Empty Cart Animation */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#105652]/20 to-[#1E8479]/20 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </p>
          
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#105652] to-[#1E8479] text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#105652]/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#105652]" />
            <span className="text-sm font-medium text-[#105652]">Shopping Cart</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
          <p className="text-gray-500 mt-1">{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {/* Cart Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Cart Items */}
          <div className="divide-y divide-gray-100">
            {cart.map((item, index) => {
              const price = item.onSale && item.discountedPrice ? item.discountedPrice : item.price;
              const itemTotal = price * item.quantity;
              
              return (
                <div 
                  key={item.id} 
                  className="p-6 flex gap-5 hover:bg-gray-50/50 transition-colors group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 group-hover:shadow-lg transition-shadow">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {item.onSale && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.category && (
                          <span className="text-xs text-[#105652] bg-[#105652]/10 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow transition-all text-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow transition-all text-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#105652]">${itemTotal.toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">${price?.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Section */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-5 h-5 text-[#105652]" />
              <span className="font-medium text-gray-800">Have a coupon?</span>
            </div>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                    <p className="text-sm text-green-600">
                      {appliedCoupon.type === 'percent' 
                        ? `${appliedCoupon.value}% off` 
                        : `$${appliedCoupon.value.toFixed(2)} off`}
                      {appliedCoupon.applyTo === 'product' && ` on ${appliedCoupon.productName}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="p-2 text-green-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#105652] focus:border-transparent uppercase tracking-wider"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-6 py-3 bg-[#105652] text-white font-medium rounded-xl hover:bg-[#0d4543] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {couponLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {couponError}
                  </p>
                )}
                {showCouponSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Coupon applied successfully!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">${cartSubtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-4 h-4" />
                    Discount ({appliedCoupon?.code})
                  </span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-3xl font-bold text-[#105652]">${cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <p className="text-right text-sm text-green-600 mt-1">
                    You save ${discount.toFixed(2)}!
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/shop"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#105652] text-[#105652] font-semibold rounded-2xl hover:bg-[#105652]/5 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>
              <Link
                to="/checkout"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#105652] to-[#1E8479] text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-8 mt-8 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>100% Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
