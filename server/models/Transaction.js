import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
   transactionId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['emi_payment', 'loan_disbursement', 'penalty', 'refund'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'bank_transfer'],
      required: true
    },
    description: String,
    gatewayResponse: {
      gatewayTransactionId: String,
      responseCode: String,
      responseMessage: String,
      bankReference: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

// Update the updatedAt field before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate transaction ID if not present
  // if (!this.transactionId) {
  //   this.transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
  // }
  
  next();
});

// Index for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

export default mongoose.model('Transaction', transactionSchema);