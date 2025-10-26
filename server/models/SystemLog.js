import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['backup', 'cache_clear', 'diagnostics', 'settings_reset', 'system'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  details: mongoose.Schema.Types.Mixed,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('SystemLog', systemLogSchema);