import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { databaseService } from '../lib/appwrite';
import { Query } from 'appwrite';

const CartContext = createContext();

const COUPON_COLLECTION = 'coupons';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shop_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    // Clear coupon if it was for this specific product
    if (appliedCoupon?.applyTo === 'product' && appliedCoupon?.productId === productId) {
      setAppliedCoupon(null);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculate subtotal (before coupon)
  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.onSale && item.discountedPrice ? item.discountedPrice : item.price;
    return sum + (price * item.quantity);
  }, 0);

  // Calculate discount amount
  const calculateDiscount = useCallback(() => {
    if (!appliedCoupon) return 0;

    // Check if coupon applies to specific product
    if (appliedCoupon.applyTo === 'product') {
      const targetItem = cart.find(item => item.id === appliedCoupon.productId);
      if (!targetItem) return 0;

      const itemPrice = targetItem.onSale && targetItem.discountedPrice 
        ? targetItem.discountedPrice 
        : targetItem.price;
      const itemTotal = itemPrice * targetItem.quantity;

      if (appliedCoupon.type === 'percent') {
        return (itemTotal * appliedCoupon.value) / 100;
      } else {
        return Math.min(appliedCoupon.value, itemTotal);
      }
    }

    // Cart-wide coupon
    if (appliedCoupon.type === 'percent') {
      return (cartSubtotal * appliedCoupon.value) / 100;
    } else {
      return Math.min(appliedCoupon.value, cartSubtotal);
    }
  }, [appliedCoupon, cart, cartSubtotal]);

  const discount = calculateDiscount();
  const cartTotal = Math.max(0, cartSubtotal - discount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Apply coupon
  const applyCoupon = async (code) => {
    if (!code?.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const result = await databaseService.listDocuments(COUPON_COLLECTION);
      
      if (!result.success) {
        setCouponError('Failed to validate coupon');
        setCouponLoading(false);
        return false;
      }

      const coupon = result.data.documents.find(
        c => c.code.toUpperCase() === code.toUpperCase().trim()
      );

      if (!coupon) {
        setCouponError('Invalid coupon code');
        setCouponLoading(false);
        return false;
      }

      // Check if active
      if (!coupon.isActive) {
        setCouponError('This coupon is no longer active');
        setCouponLoading(false);
        return false;
      }

      // Check expiry
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        setCouponError('This coupon has expired');
        setCouponLoading(false);
        return false;
      }

      // Check max uses
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        setCouponError('This coupon has reached its usage limit');
        setCouponLoading(false);
        return false;
      }

      // Check minimum purchase
      if (coupon.minPurchase > 0 && cartSubtotal < coupon.minPurchase) {
        setCouponError(`Minimum purchase of $${coupon.minPurchase.toFixed(2)} required`);
        setCouponLoading(false);
        return false;
      }

      // Check if product-specific coupon and product is in cart
      if (coupon.applyTo === 'product') {
        const productInCart = cart.find(item => item.id === coupon.productId);
        if (!productInCart) {
          setCouponError(`This coupon is only valid for: ${coupon.productName}`);
          setCouponLoading(false);
          return false;
        }
      }

      // Apply the coupon
      setAppliedCoupon({
        id: coupon.$id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        applyTo: coupon.applyTo,
        productId: coupon.productId,
        productName: coupon.productName,
      });

      setCouponLoading(false);
      return true;
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
      setCouponLoading(false);
      return false;
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartSubtotal,
      cartTotal, 
      cartCount,
      appliedCoupon,
      discount,
      couponError,
      couponLoading,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
