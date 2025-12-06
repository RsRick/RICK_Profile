import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export default function PayPalButton({ 
  amount, 
  currency = 'USD', 
  onSuccess, 
  onError, 
  onCancel,
  disabled = false,
  items = [],
  customerInfo = {}
}) {
  const paypalRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const buttonsRendered = useRef(false);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      
      if (existingScript) {
        if (window.paypal) {
          setSdkReady(true);
          setLoading(false);
        } else {
          existingScript.addEventListener('load', () => {
            setSdkReady(true);
            setLoading(false);
          });
        }
        return;
      }

      if (!PAYPAL_CLIENT_ID) {
        setError('PayPal Client ID not configured');
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}&intent=capture`;
      script.async = true;
      
      script.onload = () => {
        setSdkReady(true);
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to load PayPal SDK');
        setLoading(false);
      };

      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, [currency]);

  // Render PayPal buttons
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || disabled || buttonsRendered.current) return;
    if (!window.paypal) return;

    // Clear previous buttons
    paypalRef.current.innerHTML = '';
    buttonsRendered.current = true;

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45,
        },

        // Create order
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: currency,
                    value: amount.toFixed(2)
                  }
                }
              },
              items: items.length > 0 ? items.map(item => ({
                name: item.name.substring(0, 127),
                unit_amount: {
                  currency_code: currency,
                  value: (item.onSale && item.discountedPrice ? item.discountedPrice : item.price).toFixed(2)
                },
                quantity: item.quantity.toString()
              })) : [{
                name: 'Order',
                unit_amount: {
                  currency_code: currency,
                  value: amount.toFixed(2)
                },
                quantity: '1'
              }]
            }],
            application_context: {
              brand_name: 'Portfolio Shop',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW'
            }
          });
        },

        // On approve - capture the order
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            
            const orderData = {
              orderId: details.id,
              status: details.status,
              payer: {
                name: details.payer?.name?.given_name + ' ' + details.payer?.name?.surname,
                email: details.payer?.email_address,
                payerId: details.payer?.payer_id
              },
              amount: details.purchase_units[0]?.amount?.value,
              currency: details.purchase_units[0]?.amount?.currency_code,
              createTime: details.create_time,
              updateTime: details.update_time,
              customerInfo
            };

            if (onSuccess) {
              onSuccess(orderData);
            }
          } catch (err) {
            console.error('PayPal capture error:', err);
            if (onError) {
              onError(err);
            }
          }
        },

        // On cancel
        onCancel: (data) => {
          console.log('PayPal payment cancelled:', data);
          if (onCancel) {
            onCancel(data);
          }
        },

        // On error
        onError: (err) => {
          console.error('PayPal error:', err);
          if (onError) {
            onError(err);
          }
        }
      }).render(paypalRef.current);
    } catch (err) {
      console.error('Error rendering PayPal buttons:', err);
      setError('Failed to render PayPal buttons');
    }
  }, [sdkReady, amount, currency, disabled, items, customerInfo, onSuccess, onError, onCancel]);

  // Reset buttons when amount changes
  useEffect(() => {
    if (buttonsRendered.current && paypalRef.current) {
      buttonsRendered.current = false;
      paypalRef.current.innerHTML = '';
    }
  }, [amount]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-red-400 mt-1">Please try again later</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#0070ba]" />
        <span className="text-sm text-gray-600">Loading PayPal...</span>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="text-sm text-gray-500">Please fill in all required fields to continue</p>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      <div ref={paypalRef} className="min-h-[45px]" />
    </div>
  );
}
