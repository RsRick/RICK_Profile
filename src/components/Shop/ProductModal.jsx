import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight, Star, Heart, Share2, Check, Package, Shield, Truck } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function ProductModal({ product, onClose, relatedProducts, onAddToCart, onProductClick }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const allImages = [
    product.fullImageUrl || product.imageUrl,
    ...(product.galleryUrls || [])
  ].filter(Boolean);

  const hasDiscount = product.onSale && product.discountedPrice && product.discountedPrice < product.price;
  const displayPrice = hasDiscount ? product.discountedPrice : product.price;
  const totalPrice = displayPrice * quantity;
  const discountPercent = hasDiscount ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleAddToCart = () => {
    onAddToCart?.({ ...product, quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'additional', label: 'Additional Info' },
    { id: 'reviews', label: 'Reviews' },
  ];

  // Hide header when modal opens
  useEffect(() => {
    const header = document.querySelector('header');
    const originalDisplay = header?.style.display;
    if (header) header.style.display = 'none';
    return () => {
      if (header) header.style.display = originalDisplay || '';
    };
  }, []);

  return createPortal(
    <div 
      className={`fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 md:p-6 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.90)' }}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white w-full max-w-6xl shadow-2xl my-auto ${isClosing ? 'animate-slideOut' : 'animate-slideIn'}`}
        style={{ borderRadius: '24px', maxHeight: 'calc(100vh - 48px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button - Fixed position */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 p-2.5 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all hover:rotate-90 duration-300"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content Wrapper */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 48px)', borderRadius: '24px' }}>
          {/* Decorative Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#105652] via-[#1E8479] to-[#105652]" />

          {/* ========== ROW 1: Product Hero ========== */}
          <div className="grid md:grid-cols-5 gap-0">
          
          {/* Left Column - Image Gallery (3 cols) */}
          <div className="md:col-span-3 relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            {/* Badges */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              {product.onSale && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  {discountPercent}% OFF
                </span>
              )}
              {product.featured && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-[#105652] to-[#1E8479] text-white text-xs font-bold rounded-full shadow-lg">
                  ⭐ FEATURED
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2.5 rounded-full shadow-lg transition-all duration-300 ${
                  isWishlisted ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-50 text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2.5 bg-white hover:bg-[#105652] hover:text-white text-gray-600 rounded-full shadow-lg transition-all duration-300">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            {/* Main Image Container */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-xl group">
              <img
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-[#105652] hover:text-white rounded-full shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-[#105652] hover:text-white rounded-full shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Hidden on mobile */}
            {allImages.length > 1 && (
              <div className="hidden md:flex gap-2 mt-3 justify-center overflow-x-auto pb-1 px-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'ring-2 ring-[#105652] ring-offset-1 scale-105 shadow-md' 
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info (2 cols) */}
          <div className="md:col-span-2 p-5 md:p-6 flex flex-col bg-white">
            {/* Category Badge */}
            {product.category && (
              <div className="inline-flex self-start mb-2">
                <span className="px-3 py-1 bg-[#105652]/10 text-[#105652] text-xs font-semibold rounded-full border border-[#105652]/20">
                  {product.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
              {product.name}
            </h1>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {product.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full hover:bg-[#105652]/10 hover:text-[#105652] transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mb-3">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-[#105652]">${displayPrice?.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">${product.price?.toFixed(2)}</span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  You save ${(product.price - product.discountedPrice).toFixed(2)}!
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Quantity</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    className="p-2 hover:bg-[#105652] hover:text-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)} 
                    className="p-2 hover:bg-[#105652] hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-gray-500 text-xs">In Stock</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                addedToCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-[#105652] to-[#1E8479] hover:from-[#0d4543] hover:to-[#166d66] text-white'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Total */}
            <div className="flex items-center justify-between py-2.5 px-4 bg-[#105652]/5 rounded-lg mt-3 border border-[#105652]/10">
              <span className="text-gray-600 text-sm font-medium">Total</span>
              <span className="text-lg font-bold text-[#105652]">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <Truck className="w-4 h-4 text-[#105652] mb-0.5" />
                <span className="text-[10px] text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-[#105652] mb-0.5" />
                <span className="text-[10px] text-gray-600">Secure</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <Package className="w-4 h-4 text-[#105652] mb-0.5" />
                <span className="text-[10px] text-gray-600">Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ROW 2: Tabs Section ========== */}
        <div className="border-t border-gray-200">
          {/* Tab Headers */}
          <div className="flex bg-gray-50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-[#105652] bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#105652] to-[#1E8479]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 min-h-[200px] bg-white">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {product.description ? (
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 italic">No description available for this product.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'additional' && (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {product.additionalInfo ? (
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.additionalInfo) }} />
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 italic">No additional information available.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <div className="flex justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-8 h-8 text-gray-200" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-500 mb-4">No reviews yet</p>
                <button className="px-6 py-2 bg-[#105652] text-white rounded-full text-sm font-medium hover:bg-[#0d4543] transition-colors">
                  Be the first to review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========== ROW 3: Related Products ========== */}
        {relatedProducts?.length > 0 && (
          <div className="border-t border-gray-200 p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#105652] to-[#1E8479] rounded-full" />
              You May Also Like
            </h3>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x">
              {relatedProducts.slice(0, 4).map(related => (
                <button
                  key={related.id}
                  onClick={() => onProductClick?.(related)}
                  className="flex-shrink-0 w-48 bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 text-left group snap-start hover:-translate-y-1"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                    <img src={related.imageUrl} alt={related.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {related.onSale && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        SALE
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#105652] transition-colors">{related.name}</p>
                  <p className="text-lg font-bold text-[#105652]">
                    ${(related.onSale && related.discountedPrice ? related.discountedPrice : related.price)?.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

          {/* Bottom Decorative Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#105652] via-[#1E8479] to-[#105652]" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(30px) scale(0.95); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.3s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideOut { animation: slideOut 0.3s ease-out forwards; }
        .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 { color: #105652; margin-top: 1.5em; margin-bottom: 0.75em; font-weight: 700; }
        .rich-text-content h1 { font-size: 1.75em; }
        .rich-text-content h2 { font-size: 1.5em; }
        .rich-text-content h3 { font-size: 1.25em; }
        .rich-text-content p { margin-bottom: 1em; line-height: 1.8; }
        .rich-text-content ul, .rich-text-content ol { margin-left: 1.5em; margin-bottom: 1em; }
        .rich-text-content li { margin-bottom: 0.5em; }
        .rich-text-content strong, .rich-text-content b { font-weight: 700; color: #374151; }
        .rich-text-content em, .rich-text-content i { font-style: italic; }
        .rich-text-content u { text-decoration: underline; text-decoration-color: #105652; }
        .ring-3 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
      `}</style>
    </div>,
    document.body
  );
}
