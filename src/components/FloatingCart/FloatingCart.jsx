import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function FloatingCart() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // Don't show if cart is empty
  if (cartCount === 0) return null;

  const handleCheckout = () => {
    navigate('/checkout');
    setShowPreview(false);
  };

  const handleViewCart = () => {
    navigate('/cart');
    setShowPreview(false);
  };

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Cart Preview Popup */}
        {showPreview && (
          <div 
            className="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideUp"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#105652] to-[#1E8479] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Your Cart ({cartCount})</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-64 overflow-y-auto p-3 space-y-2">
              {cart.map(item => {
                const price = item.onSale && item.discountedPrice ? item.discountedPrice : item.price;
                return (
                  <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-[#105652] font-semibold">${price?.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs flex items-center justify-center"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-lg font-bold text-[#105652]">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleViewCart}
                  className="flex-1 px-3 py-2 border border-[#105652] text-[#105652] text-sm font-medium rounded-lg hover:bg-[#105652]/5 transition-colors"
                >
                  View Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-[#105652] to-[#1E8479] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          onMouseEnter={() => setShowPreview(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-[#105652] to-[#1E8479] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          
          {/* Cart Count Badge */}
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-once">
            {cartCount > 99 ? '99+' : cartCount}
          </span>

          {/* Tooltip */}
          <span className="absolute bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Checkout
          </span>
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
