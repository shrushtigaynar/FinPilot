
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    merchant: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },

    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },

    category: {
      type: String,
      required: true
    },

    description: {
      type: String,
      trim: true
    },

    paymentMethod: {
      type: String,
      default: 'PayPal'
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },


paymentProvider: {
  type: String,
  default: 'Manual'
},

providerOrderId: {
  type: String,
  sparse: true
},

providerCaptureId: {
  type: String,
  sparse: true
},

    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
