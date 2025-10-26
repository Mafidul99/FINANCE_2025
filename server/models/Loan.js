import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  loanAccountNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0
  },
  tenure: {
    type: Number,
    required: true,
    min: 1
  },
  emi: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  purpose: {
    type: String,
    required: true
  },
  disbursedDate: Date,
  completionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Loan', loanSchema);