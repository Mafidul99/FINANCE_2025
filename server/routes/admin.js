import express from 'express';
import Loan from '../models/Loan.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLoans = await Loan.countDocuments();
    const pendingLoans = await Loan.countDocuments({
      status: 'pending'
    });
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = await Transaction.aggregate([{
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$amount'
          }
        }
      }
    ]);

    const recentLoans = await Loan.find()
      .populate('user', 'name email')
      .sort({
        createdAt: -1
      })
      .limit(10);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalLoans,
          pendingLoans,
          totalTransactions,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentLoans
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all loans
router.get('/loans', auth, admin, async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('user', 'name email phone')
      .sort({
        createdAt: -1
      });

    res.json({
      status: 'success',
      data: {
        loans
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Update loan status
router.patch('/loans/:id/status', auth, admin, async (req, res) => {
  try {
    const {
      status
    } = req.body;
    const loan = await Loan.findByIdAndUpdate(
      req.params.id, {
        status
      }, {
        new: true
      }
    ).populate('user', 'name email phone');

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    // Create transaction record if loan is approved and disbursed
    if (status === 'active') {
      await Transaction.create({
        transactionId: 'DISB' + Date.now(),
        user: loan.user._id,
        loan: loan._id,
        type: 'loan_disbursement',
        amount: loan.amount,
        status: 'completed',
        paymentMethod: 'bank_transfer',
        description: `Loan disbursement for ${loan.loanAccountNumber}`
      });
    }

    res.json({
      status: 'success',
      data: {
        loan
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Disburse loan (mark as active and create disbursement transaction)
router.post('/loans/:id/disburse', auth, admin, async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id, {
        status: 'active',
        disbursedDate: new Date()
      }, {
        new: true
      }
    ).populate('user', 'name email phone');

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    // Create disbursement transaction
    await Transaction.create({
      transactionId: 'DISB' + Date.now(),
      user: loan.user._id,
      loan: loan._id,
      type: 'loan_disbursement',
      amount: loan.amount,
      status: 'completed',
      paymentMethod: 'bank_transfer',
      description: `Loan disbursement for ${loan.loanAccountNumber}`
    });

    res.json({
      status: 'success',
      message: 'Loan disbursed successfully',
      data: {
        loan
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


// Get all transactions for admin
router.get('/transactions', auth, admin, async (req, res) => {
  try {
    const payments = await Transaction.find()
      .populate('user', 'name email')
      .populate('loan', 'loanAccountNumber amount')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ status: 'success', data: { payments } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create new transactions (admin only)
router.post('/transactions', auth, admin, async (req, res) => {
  try {
    const { user, loan, amount, type, paymentMethod, status, description } = req.body;

    const transaction = await Transaction.create({
      transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
      user,
      loan: loan || undefined,
      amount,
      type,
      paymentMethod,
      status,
      description
    });

    const populatedPayment = await Transaction.findById(transaction._id)
      .populate('user', 'name email')
      .populate('loan', 'loanAccountNumber amount');

    res.status(201).json({
      status: 'success',
      message: 'Transactions created successfully',
      data: { payment: populatedPayment }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/transactions/:id', auth, admin, async (req, res) => {
  try {
    const { user, loan, amount, type, paymentMethod, status, description } = req.body;

    const payment = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        user,
        loan: loan || undefined,
        amount,
        type,
        paymentMethod,
        status,
        description,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('loan', 'loanAccountNumber amount');

    if (!payment) {
      return res.status(404).json({ message: 'Transactions not found' });
    }

    res.json({
      status: 'success',
      message: 'Transactions updated successfully',
      data: { payment }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete transactions
router.delete('/transactions/:id', auth, admin, async (req, res) => {
  try {
    const payment = await Transaction.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Transactions not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Transactions deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transactions status
router.patch('/transactions/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name email')
     .populate('loan', 'loanAccountNumber amount');

    if (!payment) {
      return res.status(404).json({ message: 'Transactions not found' });
    }

    res.json({
      status: 'success',
      message: 'Transactions status updated successfully',
      data: { payment }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});







// Get all payments for admin
router.get('/payments', auth, admin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('loan', 'loanAccountNumber amount')
      .sort({ createdAt: -1 });
    
    res.json({ status: 'success', data: { payments } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create new payment (admin only)
router.post('/payments', auth, admin, async (req, res) => {
  try {
    const { user, loan, amount, type, paymentMethod, status, description } = req.body;

    const payment = await Payment.create({
      transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
      user,
      loan: loan || undefined,
      amount,
      type,
      paymentMethod,
      status,
      description
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email')
      .populate('loan', 'loanAccountNumber amount');

    res.status(201).json({
      status: 'success',
      message: 'Payment created successfully',
      data: { payment: populatedPayment }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/payments/:id', auth, admin, async (req, res) => {
  try {
    const { user, loan, amount, type, paymentMethod, status, description } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        user,
        loan: loan || undefined,
        amount,
        type,
        paymentMethod,
        status,
        description,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('loan', 'loanAccountNumber amount');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      status: 'success',
      message: 'Payment updated successfully',
      data: { payment }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/payments/:id', auth, admin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.patch('/payments/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name email')
     .populate('loan', 'loanAccountNumber amount');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      status: 'success',
      message: 'Payment status updated successfully',
      data: { payment }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Get all users for admin
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({
      createdAt: -1
    });

    // Get loan counts for each user
    const usersWithLoans = await Promise.all(
      users.map(async (user) => {
        const loanCount = await Loan.countDocuments({
          user: user._id
        });
        return {
          ...user.toObject(),
          loans: loanCount
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        users: usersWithLoans
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Create new user (admin only)
router.post('/users', auth, admin, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      address
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      address
    });

    // Remove password from response
    const userResponse = {
      ...user.toObject()
    };
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Update user
router.put('/users/:id', auth, admin, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      address
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: {
          $ne: req.params.id
        }
      });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already taken by another user'
        });
      }
    }

    const updateData = {
      name,
      email,
      phone,
      role,
      address,
      updatedAt: new Date()
    };

    // Only update password if provided
    if (password) {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData, {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if user has any active loans
    const activeLoans = await Loan.countDocuments({
      user: req.params.id,
      status: {
        $in: ['pending', 'approved', 'active']
      }
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: 'Cannot delete user with active loans. Please reassign or close loans first.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Toggle user status (active/inactive)
router.patch('/users/:id/status', auth, admin, async (req, res) => {
  try {
    const {
      active
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id, {
        active,
        updatedAt: new Date()
      }, {
        new: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


// Financial Summary Report
router.get('/reports/financial', auth, admin, async (req, res) => {
  try {
    const {
      startDate,
      endDate
    } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total revenue from completed transactions
    const totalRevenue = await Transaction.aggregate([{
        $match: {
          ...dateFilter,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$amount'
          }
        }
      }
    ]);

    // EMI collection
    const emiCollection = await Transaction.aggregate([{
        $match: {
          ...dateFilter,
          type: 'emi_payment',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$amount'
          }
        }
      }
    ]);

    // Pending payments
    const pendingPayments = await Transaction.aggregate([{
        $match: {
          ...dateFilter,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$amount'
          }
        }
      }
    ]);

    // Average loan size
    const averageLoanSize = await Loan.aggregate([{
        $match: dateFilter
      },
      {
        $group: {
          _id: null,
          average: {
            $avg: '$amount'
          }
        }
      }
    ]);

    // Revenue by type
    const revenueByType = await Transaction.aggregate([{
        $match: {
          ...dateFilter,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          total: {
            $sum: '$amount'
          }
        }
      },
      {
        $project: {
          type: '$_id',
          amount: '$total',
          _id: 0
        }
      }
    ]);

    // Monthly trends (last 6 months)
    const monthlyTrends = await Transaction.aggregate([{
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt'
            },
            month: {
              $month: '$createdAt'
            }
          },
          revenue: {
            $sum: '$amount'
          }
        }
      },
      {
        $project: {
          month: {
            $concat: [{
                $toString: '$_id.year'
              },
              '-',
              {
                $toString: '$_id.month'
              }
            ]
          },
          revenue: 1,
          _id: 0
        }
      },
      {
        $sort: {
          month: 1
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        emiCollection: emiCollection[0]?.total || 0,
        pendingPayments: pendingPayments[0]?.total || 0,
        averageLoanSize: averageLoanSize[0]?.average || 0,
        revenueByType,
        monthlyTrends
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// User Statistics Report
router.get('/reports/user-stats', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      active: {
        $ne: false
      }
    });
    const adminUsers = await User.countDocuments({
      role: 'admin'
    });

    // New users in last 30 days
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });

    // User growth (last 6 months)
    const userGrowth = await User.aggregate([{
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt'
            },
            month: {
              $month: '$createdAt'
            }
          },
          newUsers: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          period: {
            $concat: [{
                $toString: '$_id.year'
              },
              '-',
              {
                $toString: '$_id.month'
              }
            ]
          },
          newUsers: 1,
          _id: 0
        }
      },
      {
        $sort: {
          period: 1
        }
      }
    ]);

    // Calculate total users for each period
    let runningTotal = totalUsers - newUsersThisMonth;
    const userGrowthWithTotal = userGrowth.map(period => {
      runningTotal += period.newUsers;
      return {
        ...period,
        totalUsers: runningTotal
      };
    });

    res.json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsersThisMonth,
        userGrowth: userGrowthWithTotal,
        activeSessions: Math.floor(Math.random() * 50) + 10, // Mock data
        avgSessionDuration: '15m', // Mock data
        retentionRate: 85 // Mock data
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Loan Statistics Report
router.get('/reports/loan-stats', auth, admin, async (req, res) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({
      status: 'active'
    });
    const pendingLoans = await Loan.countDocuments({
      status: 'pending'
    });

    // Total loan amount
    const totalLoanAmount = await Loan.aggregate([{
      $group: {
        _id: null,
        total: {
          $sum: '$amount'
        }
      }
    }]);

    // Average interest rate
    const avgInterestRate = await Loan.aggregate([{
      $group: {
        _id: null,
        average: {
          $avg: '$interestRate'
        }
      }
    }]);

    // Status distribution
    const statusDistribution = await Loan.aggregate([{
        $group: {
          _id: '$status',
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Default rate (mock data for now)
    const defaultRate = 2.5;

    // EMI collection rate (mock data)
    const emiCollectionRate = 92.5;

    res.json({
      status: 'success',
      data: {
        totalLoans,
        activeLoans,
        pendingLoans,
        totalLoanAmount: totalLoanAmount[0]?.total || 0,
        avgInterestRate: avgInterestRate[0]?.average || 0,
        statusDistribution,
        defaultRate,
        emiCollectionRate
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Transaction Statistics Report
router.get('/reports/transaction-stats', auth, admin, async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const failedTransactions = await Transaction.countDocuments({
      status: 'failed'
    });
    const successRate = ((totalTransactions - failedTransactions) / totalTransactions * 100) || 0;

    // Average transaction amount
    const averageTransaction = await Transaction.aggregate([{
      $group: {
        _id: null,
        average: {
          $avg: '$amount'
        }
      }
    }]);

    // Type distribution
    const typeDistribution = await Transaction.aggregate([{
        $group: {
          _id: '$type',
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await Transaction.aggregate([{
        $group: {
          _id: '$paymentMethod',
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          method: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        totalTransactions,
        failedTransactions,
        successRate: Math.round(successRate),
        averageTransaction: averageTransaction[0]?.average || 0,
        typeDistribution,
        paymentMethodDistribution
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Generate PDF Report
router.post('/reports/generate', auth, admin, async (req, res) => {
  try {
    const {
      type
    } = req.body;

    // In a real implementation, you would generate a PDF here
    // For this example, we'll return a mock PDF
    const mockPDF = `%PDF-1.4
        1 0 obj
        << /Type /Catalog /Pages 2 0 R >>
        endobj
        2 0 obj
        << /Type /Pages /Kids [3 0 R] /Count 1 >>
        endobj
        3 0 obj
        << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
        endobj
        4 0 obj
        << /Length 44 >>
        stream
        BT /F1 12 Tf 100 700 Td (${type} Report - Generated on ${new Date().toLocaleDateString()}) Tj ET
        endstream
        endobj
        xref
        0 5
        0000000000 65535 f 
        0000000009 00000 n 
        0000000058 00000 n 
        0000000115 00000 n 
        0000000233 00000 n 
        trailer
        << /Size 5 /Root 1 0 R >>
        startxref
        308
        %%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
    res.send(mockPDF);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});








export default router;