const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    required: true 
  },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['khalti', 'esewa', 'cash'], 
    default: 'khalti' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);