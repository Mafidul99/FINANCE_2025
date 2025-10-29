const axios = require('axios');

class CashfreeService {
  constructor() {
    this.clientId = process.env.CASHFREE_APP_ID;
    this.clientSecret = process.env.CASHFREE_SECRET_KEY;
    this.baseURL = process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg';
  }

  async createOrder(orderData) {
    try {
      const response = await axios.post(`${this.baseURL}/orders`, orderData, {
        headers: {
          'x-client-id': this.clientId,
          'x-client-secret': this.clientSecret,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Cashfree Order Error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(orderId) {
    try {
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: {
          'x-client-id': this.clientId,
          'x-client-secret': this.clientSecret,
          'x-api-version': '2022-09-01'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Payment verification failed'
      };
    }
  }
}

module.exports = new CashfreeService();