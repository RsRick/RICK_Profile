// Order Email Service - Calls the Appwrite order-emails function
import { functions } from './appwrite';

const ORDER_EMAIL_FUNCTION_ID = 'order-emails';

/**
 * Send order email notification
 * @param {string} type - 'placed' | 'processing' | 'cancelled' | 'completed'
 * @param {object} orderData - Order details
 */
export const sendOrderEmail = async (type, orderData) => {
  try {
    const payload = {
      type,
      email: orderData.customerEmail,
      customerName: orderData.customerName,
      orderId: orderData.orderId || orderData.$id,
      dbOrderId: orderData.dbOrderId || orderData.$id, // Database document ID for direct order link
      items: typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items),
      subtotal: orderData.subtotal || orderData.total,
      discount: orderData.discount || 0,
      total: orderData.total,
      customMessage: orderData.customMessage || '',
      deliveryFiles: orderData.deliveryFiles 
        ? (typeof orderData.deliveryFiles === 'string' ? orderData.deliveryFiles : JSON.stringify(orderData.deliveryFiles))
        : '[]',
      orderDate: orderData.orderDate || new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
    };

    console.log(`Sending ${type} email to ${orderData.customerEmail}...`);

    const result = await functions.createExecution(
      ORDER_EMAIL_FUNCTION_ID,
      JSON.stringify({ data: payload }),
      false // async execution
    );

    // Parse response
    let response;
    try {
      response = JSON.parse(result.responseBody || '{}');
    } catch {
      response = { success: false, error: 'Invalid response' };
    }

    if (response.success) {
      console.log(`✅ ${type} email sent successfully!`);
      return { success: true, messageId: response.messageId };
    } else {
      console.error(`❌ Failed to send ${type} email:`, response.error);
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error(`❌ Error sending ${type} email:`, error);
    return { success: false, error: error.message };
  }
};

// Convenience functions for each email type
export const sendOrderPlacedEmail = (orderData) => sendOrderEmail('placed', orderData);
export const sendOrderProcessingEmail = (orderData, customMessage) => sendOrderEmail('processing', { ...orderData, customMessage });
export const sendOrderCancelledEmail = (orderData, customMessage) => sendOrderEmail('cancelled', { ...orderData, customMessage });
export const sendOrderCompletedEmail = (orderData) => sendOrderEmail('completed', orderData);
