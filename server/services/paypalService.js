
const axios = require('axios');

const getPayPalAccessToken = async () => {
  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
};

// Create a PayPal order
const createPayPalOrder = async (amount, currency) => {
  const accessToken = await getPayPalAccessToken();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }
      ],
      application_context: {
        return_url: `${clientUrl}/payment-success`,
        cancel_url: `${clientUrl}/payment-cancel`
      }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Capture an approved PayPal order
const capturePayPalOrder = async (orderId) => {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

module.exports = {
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder
};
