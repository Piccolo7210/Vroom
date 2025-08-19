import SSLCommerzPayment from 'sslcommerz-lts';
import dotenv from 'dotenv';

dotenv.config();

// SSLCommerz Payment Service
const store_id = process.env.STORE_ID; 
const store_passwd = process.env.STORE_PASS;  
const is_live = false;  

export const initiatePayment = async (paymentData) => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const data = {
    total_amount: paymentData.amount,
    currency: 'BDT',
    tran_id: paymentData.tran_id,  // Unique transaction ID
    success_url: `${process.env.SERVER_URL}/api/payment/success/${paymentData.ride_id}`,
    fail_url: `${process.env.SERVER_URL}/api/payment/fail/${paymentData.ride_id}`,
    cancel_url: `${process.env.SERVER_URL}/api/payment/cancel/${paymentData.ride_id}`,
    ipn_url: `${process.env.SERVER_URL}/api/payment/ipn`,
    shipping_method: 'Courier',
    product_name: paymentData.product_name,
    product_category: paymentData.product_category,
    product_profile: 'general',
    cus_name: paymentData.cus_name,
    cus_email: paymentData.cus_email,
    cus_add1: paymentData.cus_address,
    cus_city: paymentData.cus_city,
    cus_state: paymentData.cus_state,
    cus_postcode: paymentData.cus_postcode,
    cus_country: paymentData.cus_country,
    cus_phone: paymentData.cus_phone,
    ship_name: paymentData.ship_name,
    ship_add1: paymentData.ship_address,
    ship_city: paymentData.ship_city,
    ship_state: paymentData.ship_state,
    ship_postcode: paymentData.ship_postcode,
    ship_country: paymentData.ship_country,
  };

  try {
    const apiResponse = await sslcz.init(data);
    return apiResponse;  // Return the full response, not just GatewayPageURL
  } catch (error) {
    throw new Error('Failed to initiate payment');
  }
};
