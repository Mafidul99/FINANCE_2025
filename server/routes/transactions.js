import express from 'express';
import { Cashfree } from 'cashfree-pg';
import Transaction from '../models/Transaction.js';
import Loan from '../models/Loan.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = process.env.NODE_ENV === 'production'
// ? Cashfree.Environment.PRODUCTION 
// : Cashfree.Environment.SANDBOX;


// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const {
      loanId,
      amount,
      paymentMethod
    } = req.body;

    // Validate loan exists and belongs to user
    const loan = await Loan.findOne({
      _id: loanId,
      user: req.user.id
    });
    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

    const transaction = await Transaction.create({
      transactionId,
      user: req.user.id,
      loan: loanId,
      type: 'emi_payment',
      amount,
      paymentMethod,
      status: 'pending',
      description: `EMI Payment for Loan ${loan.loanAccountNumber}`
    });

    // Create Cashfree order
    const orderRequest = {
      order_amount: amount,
      order_currency: 'INR',
      order_id: transactionId,
      customer_details: {
        customer_id: req.user.id,
        customer_email: req.user.email,
        customer_phone: req.user.phone || '9999999999'
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-callback?order_id={order_id}`
      }
    };

    const orderResponse = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);

    res.json({
      status: 'success',
      data: {
        paymentSessionId: orderResponse.data.payment_session_id,
        orderId: orderResponse.data.order_id,
        transaction,
        paymentLink: orderResponse.data.payments?.url // For direct payment link
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(400).json({
      message: error.response?.data?.message || 'Failed to create payment order'
    });
  }
});

// Get payment status
router.get('/order-status/:orderId', auth, async (req, res) => {
  try {
    const {
      orderId
    } = req.params;

    const orderResponse = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

    // Update transaction status based on payment status
    const transaction = await Transaction.findOne({
      transactionId: orderId
    });
    if (transaction) {
      const transactionStatus = orderResponse.data[0]?.payment_status;
      if (transactionStatus === 'SUCCESS') {
        transaction.status = 'completed';
      } else if (transactionStatus === 'FAILED') {
        transaction.status = 'failed';
      }
      await transaction.save();
    }

    res.json({
      status: 'success',
      data: {
        orderStatus: orderResponse.data[0]?.payment_status || 'PENDING'
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Payment webhook (for server-to-server notifications)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-cf-signature'];
    // Verify signature in production

    const {
      data
    } = req.body;
    const {
      order
    } = data;

    const transaction = await Transaction.findOne({
      transactionId: order.order_id
    });

    if (transaction) {
      if (order.order_status === 'PAID') {
        transaction.status = 'completed';

        // Update loan if it's an EMI payment
        if (transaction.type === 'emi_payment') {
          await Loan.findByIdAndUpdate(transaction.loan, {
            lastPaymentDate: new Date()
          });
        }
      } else {
        transaction.status = 'failed';
      }

      await transaction.save();
    }

    res.status(200).json({
      status: 'success'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      message: error.message
    });
  }
});

// Get user transactions
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
        user: req.user.id
      })
      .populate('loan', 'loanAccountNumber amount')
      .sort({
        createdAt: -1
      });

    res.json({
      status: 'success',
      data: {
        transactions
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Make a payment
router.post('/make-payment', auth, async (req, res) => {
  try {
    const {
      loanId,
      amount,
      paymentMethod
    } = req.body;

    // Verify loan exists and belongs to user
    const loan = await Loan.findOne({
      _id: loanId,
      user: req.user.id
    });
    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    // Create payment record
    const transaction = await Transaction.create({
      transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
      user: req.user.id,
      loan: loanId,
      amount,
      type: 'emi_payment',
      paymentMethod,
      status: 'pending',
      description: `EMI Payment for Loan ${loan.loanAccountNumber}`
    });

    // In real implementation, integrate with payment gateway
    // For demo, we'll return a mock order ID
    const orderId = 'ORDER' + Date.now();

    res.json({
      status: 'success',
      data: {
        transaction,
        orderId,
        paymentLink: `https://payment-gateway.com/pay/${orderId}` // Mock payment link
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Verify payment status
router.get('/verify/:orderId', auth, async (req, res) => {
  try {
    const {
      orderId
    } = req.params;

    // In real implementation, verify with payment gateway
    // For demo, we'll simulate successful payment
    const transaction = await Transaction.findOneAndUpdate({
      transactionId: orderId.replace('ORDER', 'TXN')
    }, {
      status: 'completed'
    }, {
      new: true
    }).populate('loan', 'loanAccountNumber amount');

    if (!transaction) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        transaction
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get transaction by ID
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const transaction = await Transaction.findById(req.params.id)
//       .populate('user', 'name email')
//       .populate('loan', 'loanAccountNumber');

//     if (!transaction) {
//       return res.status(404).json({
//         message: 'Transaction not found'
//       });
//     }

//     // Check if user owns the transaction or is admin
//     if (transaction.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         message: 'Access denied'
//       });
//     }

//     res.json({
//       status: 'success',
//       data: {
//         transaction
//       }
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message
//     });
//   }
// });





export default router;