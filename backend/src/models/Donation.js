import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donorName:    { type: String, required: true },
  donorPhone:   { type: String },
  donorEmail:   { type: String },
  amount:       { type: Number, required: true },
  purpose:      { type: String, enum: ['General','Annadanam','Temple Renovation','Festival','Education','Other'], default: 'General' },
  paymentMethod:{ type: String, enum: ['online','cash','upi','card','cheque','bank_transfer'], default: 'online' },
  paymentStatus:{ type: String, enum: ['pending','paid','failed'], default: 'pending' },
  bookingSource:{ type: String, enum: ['online','offline'], default: 'online' },
  collectedBy:  { type: String },
  receiptNumber:{ type: String },
  stripePaymentIntentId: { type: String },
  notes:        { type: String },
}, { timestamps: true });

export default mongoose.model('Donation', donationSchema);
