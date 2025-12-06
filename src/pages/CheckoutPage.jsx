import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CreditCard, CheckCircle, Tag, User, Mail, Phone, Lock, Sparkles, LogOut, X, Ticket, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useShopAuth } from '../contexts/ShopAuthContext';
import { databaseService, ID } from '../lib/appwrite';
import OTPVerification from '../components/OTPVerification/OTPVerification';
import PayPalButton from '../components/PayPalButton/PayPalButton';
import { sendOrderPlacedEmail } from '../lib/orderEmailService';
import styled from 'styled-components';

const ORDERS_COLLECTION = 'orders';

export default function CheckoutPage() {
  const { 
    cart, 
    cartSubtotal,
    cartTotal, 
    cartCount, 
    clearCart,
    appliedCoupon,
    discount,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { customer, isAuthenticated, signUp, completeSignUp, login, logout, resendOTP } = useShopAuth();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // OTP verification state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpId, setOtpId] = useState('');
  const [tempAuthData, setTempAuthData] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showNewOtpNotification, setShowNewOtpNotification] = useState(false);
  
  const navigate = useNavigate();

  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [contactForm, setContactForm] = useState({ phone: '', altEmail: '' });

  // Auto-apply coupon when pasting
  useEffect(() => {
    const handlePaste = async (e) => {
      if (document.activeElement?.id !== 'checkout-coupon-input') return;
      
      const pastedText = e.clipboardData?.getData('text')?.trim();
      if (pastedText && pastedText.length >= 4 && pastedText.length <= 20) {
        setCouponCode(pastedText.toUpperCase());
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow - will trigger OTP
        if (!authForm.name || !authForm.email || !authForm.password) {
          setAuthError('Please fill in all fields');
          setAuthLoading(false);
          return;
        }

        if (authForm.password.length < 6) {
          setAuthError('Password must be at least 6 characters');
          setAuthLoading(false);
          return;
        }

        const result = await signUp(authForm.name, authForm.email, authForm.password);
        
        if (result.success && result.requiresVerification) {
          // Show OTP modal
          setOtpId(result.otpId);
          setTempAuthData(result.tempData);
          setShowOTPModal(true);
          setShowNewOtpNotification(false);
        } else if (result.requiresVerification) {
          // Account exists but not verified (from signup error)
          setOtpId(result.otpId);
          setTempAuthData({ email: authForm.email, name: authForm.name });
          setShowOTPModal(true);
          setShowNewOtpNotification(result.newOtpSent || false);
          setAuthError(''); // Clear error since we're showing OTP modal
        } else if (!result.success) {
          setAuthError(result.error);
        }
      } else {
        // Login flow
        if (!authForm.email || !authForm.password) {
          setAuthError('Please enter email and password');
          setAuthLoading(false);
          return;
        }

        const result = await login(authForm.email, authForm.password);
        
        if (result.requiresVerification) {
          // User has unverified OTP, show OTP modal
          setOtpId(result.otpId);
          setTempAuthData({ email: authForm.email, name: '' });
          setShowOTPModal(true);
          setShowNewOtpNotification(true); // New OTP was sent during login
        } else if (!result.success) {
          setAuthError(result.error);
        }
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setOtpLoading(true);
    try {
      const result = await completeSignUp(tempAuthData, otpId, otp);
      
      if (result.success) {
        setShowOTPModal(false);
        setTempAuthData(null);
        setOtpId('');
        // User is now logged in
      } else {
        // Show error in OTP modal
        alert(result.error);
      }
    } catch (error) {
      alert('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (tempAuthData) {
      const result = await resendOTP(tempAuthData.email, tempAuthData.name);
      if (result.success) {
        setOtpId(result.otpId);
        setShowNewOtpNotification(true);
      }
    }
  };

  // Save order to database
  const saveOrder = async (paypalData = null) => {
    const orderId = paypalData?.orderId || 'FREE-' + Date.now();
    
    // Prepare items as JSON string for Appwrite
    const itemsArray = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.onSale && item.discountedPrice ? item.discountedPrice : item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl || ''
    }));
    
    const orderData = {
      orderId,
      customerId: customer?.id || '',
      customerName: customer?.name || '',
      customerEmail: customer?.email || '',
      customerPhone: contactForm.phone,
      customerAltEmail: contactForm.altEmail,
      items: JSON.stringify(itemsArray),
      subtotal: cartSubtotal,
      discount: discount,
      couponCode: appliedCoupon?.code || '',
      total: cartTotal,
      status: 'placed',
      paypalOrderId: paypalData?.orderId || '',
      paypalPayerId: paypalData?.payer?.payerId || '',
      paypalPayerEmail: paypalData?.payer?.email || '',
      step1Time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      step1Notes: '',
      step2Time: '',
      step2Notes: '',
      step3Time: '',
      step3Notes: '',
    };

    try {
      const result = await databaseService.createDocument(
        ORDERS_COLLECTION,
        orderData
      );
      
      if (result.success) {
        // Send order placed email automatically
        try {
          await sendOrderPlacedEmail({
            customerEmail: orderData.customerEmail,
            customerName: orderData.customerName,
            orderId: orderData.orderId,
            dbOrderId: result.data.$id, // Database document ID for direct link
            items: itemsArray,
            subtotal: orderData.subtotal,
            discount: orderData.discount,
            total: orderData.total,
            orderDate: orderData.step1Time,
          });
          console.log('Order confirmation email sent');
        } catch (emailError) {
          console.error('Failed to send order email:', emailError);
          // Don't fail the order if email fails
        }
        
        return { success: true, orderId: result.data.$id, data: orderData };
      }
      return { success: false };
    } catch (error) {
      console.error('Error saving order:', error);
      return { success: false };
    }
  };

  const handlePlaceOrder = async () => {
    if (!contactForm.phone || !contactForm.altEmail) {
      alert('Please fill in all contact details');
      return;
    }
    
    const result = await saveOrder();
    
    setOrderPlaced(true);
    setOrderDetails({ orderId: result.orderId || 'FREE-' + Date.now(), status: 'COMPLETED' });
    
    setTimeout(() => {
      clearCart();
      navigate('/dashboard');
    }, 3000);
  };

  // PayPal success handler
  const handlePayPalSuccess = async (orderData) => {
    console.log('PayPal payment successful:', orderData);
    
    // Save order to database
    const result = await saveOrder(orderData);
    
    setOrderDetails({
      ...orderData,
      dbOrderId: result.orderId
    });
    setOrderPlaced(true);
    
    // Clear cart and redirect to dashboard
    setTimeout(() => {
      clearCart();
      navigate('/dashboard');
    }, 4000);
  };

  // PayPal error handler
  const handlePayPalError = (error) => {
    console.error('PayPal payment error:', error);
    setPaymentError('Payment failed. Please try again.');
    setTimeout(() => setPaymentError(null), 5000);
  };

  // PayPal cancel handler
  const handlePayPalCancel = () => {
    setPaymentError('Payment was cancelled.');
    setTimeout(() => setPaymentError(null), 3000);
  };

  const handleLogout = () => {
    logout();
    setAuthForm({ name: '', email: '', password: '' });
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 text-sm mb-4">Thank you for your purchase.</p>
          
          {orderDetails && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono text-gray-800">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-green-600 font-medium">{orderDetails.status}</span>
                </div>
                {orderDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-semibold text-gray-800">${orderDetails.amount} {orderDetails.currency}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mb-4">Redirecting to home page...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#105652] mx-auto" />
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Cart is Empty</h2>
          <Link to="/shop" className="inline-flex items-center gap-2 px-5 py-2 bg-[#105652] text-white text-sm rounded-lg hover:bg-[#0d4543]">
            <ShoppingCart className="w-4 h-4" /> Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CheckoutWrapper className="min-h-screen py-6 px-4">
      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPVerification
          email={tempAuthData?.email || ''}
          onVerify={handleOTPVerify}
          onClose={() => {
            setShowOTPModal(false);
            setTempAuthData(null);
            setOtpId('');
            setShowNewOtpNotification(false);
          }}
          onResend={handleResendOTP}
          isLoading={otpLoading}
          showNewOtpNotification={showNewOtpNotification}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Auth Section - Flip Card Design */}
            {!isAuthenticated ? (
              <div className="auth-card">
                <div className="auth-card-inner">
                  {/* Decorative Elements */}
                  <div className="auth-decoration">
                    <div className="decoration-circle circle-1" />
                    <div className="decoration-circle circle-2" />
                    <div className="decoration-circle circle-3" />
                  </div>

                  {/* Header with Toggle */}
                  <div className="auth-header">
                    <div className="auth-icon-wrapper">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="auth-tabs">
                      <button 
                        className={`auth-tab ${!isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(false); setAuthError(''); }}
                      >
                        Login
                      </button>
                      <button 
                        className={`auth-tab ${isSignUp ? 'active' : ''}`}
                        onClick={() => { setIsSignUp(true); setAuthError(''); }}
                      >
                        Sign Up
                      </button>
                      <div className={`tab-indicator ${isSignUp ? 'right' : 'left'}`} />
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleAuth} className="auth-form">
                    <div className={`form-slide ${isSignUp ? 'signup' : 'login'}`}>
                      {isSignUp && (
                        <div className="input-wrapper">
                          <div className="input-icon-box">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={authForm.name}
                            onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                            className="auth-input"
                            required={isSignUp}
                          />
                          <div className="input-border" />
                        </div>
                      )}
                      <div className="input-wrapper">
                        <div className="input-icon-box">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={authForm.email}
                          onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                          className="auth-input"
                          required
                        />
                        <div className="input-border" />
                      </div>
                      <div className="input-wrapper">
                        <div className="input-icon-box">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          placeholder="Password"
                          value={authForm.password}
                          onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                          className="auth-input"
                          required
                        />
                        <div className="input-border" />
                      </div>
                    </div>

                    {authError && (
                      <p className="text-red-500 text-xs text-center mb-2">{authError}</p>
                    )}

                    <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                      {authLoading ? (
                        <span className="loading-spinner" />
                      ) : (
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      )}
                      <div className="btn-shine" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Contact Details - Logged In */
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Welcome back</p>
                      <p className="text-sm font-medium text-gray-800">{customer?.name || customer?.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#105652]" />
                    Contact Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#105652] focus:bg-white transition-all"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Alternative Email *"
                      value={contactForm.altEmail}
                      onChange={(e) => setContactForm({...contactForm, altEmail: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#105652] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#105652]" />
                Have a Coupon?
              </h2>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.type === 'percent' 
                          ? `${appliedCoupon.value}% off` 
                          : `$${appliedCoupon.value.toFixed(2)} off`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1.5 text-green-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="checkout-coupon-input"
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#105652] focus:bg-white uppercase tracking-wider transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-2.5 bg-[#105652] text-white text-sm font-medium rounded-xl hover:bg-[#0d4543] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                  {showCouponSuccess && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Coupon applied! You save ${discount.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-6 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {cart.map(item => {
                  const price = item.onSale && item.discountedPrice ? item.discountedPrice : item.price;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-800">${(price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      Discount ({appliedCoupon?.code})
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#105652]">${cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-green-600 text-right">You save ${discount.toFixed(2)}!</p>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {/* Payment Error */}
                {paymentError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{paymentError}</p>
                  </div>
                )}

                {!isAuthenticated ? (
                  <p className="text-xs text-center text-gray-500 py-3 bg-gray-50 rounded-lg">
                    Please sign in to continue
                  </p>
                ) : cartTotal === 0 ? (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!contactForm.phone || !contactForm.altEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#105652] to-[#1E8479] text-white text-sm font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Place Order (Free)
                  </button>
                ) : (
                  <PayPalButton
                    amount={cartTotal}
                    currency="USD"
                    items={cart}
                    customerInfo={{
                      email: customer?.email,
                      name: customer?.name,
                      phone: contactForm.phone,
                      altEmail: contactForm.altEmail
                    }}
                    disabled={!contactForm.phone || !contactForm.altEmail}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                    onCancel={handlePayPalCancel}
                  />
                )}
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                By placing order, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </CheckoutWrapper>
  );
}


const CheckoutWrapper = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

  .auth-card {
    position: relative;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 
      0 10px 40px rgba(16, 86, 82, 0.1),
      0 0 0 1px rgba(16, 86, 82, 0.05);
    overflow: hidden;
  }

  .auth-card-inner {
    position: relative;
    z-index: 1;
  }

  .auth-decoration {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, #105652, #1E8479);
    opacity: 0.05;
  }

  .circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -50px;
    animation: float 8s ease-in-out infinite;
  }

  .circle-2 {
    width: 150px;
    height: 150px;
    bottom: -50px;
    left: -30px;
    animation: float 6s ease-in-out infinite reverse;
  }

  .circle-3 {
    width: 80px;
    height: 80px;
    top: 50%;
    right: 20%;
    animation: float 10s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }

  .auth-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .auth-icon-wrapper {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #105652, #1E8479);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(16, 86, 82, 0.3);
  }

  .auth-tabs {
    position: relative;
    display: flex;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
    flex: 1;
    max-width: 200px;
  }

  .auth-tab {
    flex: 1;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    z-index: 1;
    transition: color 0.3s;
  }

  .auth-tab.active {
    color: white;
  }

  .tab-indicator {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: calc(50% - 4px);
    background: linear-gradient(135deg, #105652, #1E8479);
    border-radius: 8px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(16, 86, 82, 0.3);
  }

  .tab-indicator.left {
    transform: translateX(0);
  }

  .tab-indicator.right {
    transform: translateX(calc(100% + 8px));
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-slide {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid transparent;
    transition: all 0.3s;
    overflow: hidden;
  }

  .input-wrapper:focus-within {
    background: white;
    border-color: #105652;
    box-shadow: 0 0 0 4px rgba(16, 86, 82, 0.1);
  }

  .input-icon-box {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    flex-shrink: 0;
    transition: color 0.3s;
  }

  .input-wrapper:focus-within .input-icon-box {
    color: #105652;
  }

  .auth-input {
    flex: 1;
    padding: 12px 16px 12px 0;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #1e293b;
    outline: none;
  }

  .auth-input::placeholder {
    color: #94a3b8;
  }

  .input-border {
    position: absolute;
    bottom: 0;
    left: 44px;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #105652, #1E8479);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s;
  }

  .input-wrapper:focus-within .input-border {
    transform: scaleX(1);
  }

  .auth-submit-btn {
    position: relative;
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #105652, #1E8479);
    color: white;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(16, 86, 82, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 86, 82, 0.4);
  }

  .auth-submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .auth-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .auth-submit-btn:hover .btn-shine {
    left: 100%;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
