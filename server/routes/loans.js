import express from 'express';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Generate random loan account number
const generateLoanAccountNumber = () => {
  return 'LN' + Date.now() + Math.floor(Math.random() * 1000);
};

// Apply for loan
router.post('/apply', auth, async (req, res) => {
  try {
    const { amount, interestRate, tenure, purpose } = req.body;
    
    const emi = calculateEMI(amount, interestRate, tenure);
    
    const loan = await Loan.create({
      loanAccountNumber: generateLoanAccountNumber(),
      user: req.user.id,
      amount,
      interestRate,
      tenure,
      emi,
      purpose
    });

    res.status(201).json({
      status: 'success',
      data: { loan }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user loans
router.get('/my-loans', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: { loans } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get loan details
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('user', 'name email');
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Check if user owns the loan or is admin
    if (loan.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ status: 'success', data: { loan } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
}

export default router;