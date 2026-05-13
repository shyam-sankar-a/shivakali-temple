import mongoose from 'mongoose';

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
];

const devoteeSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  nakshatra:{ type: String, required: true, enum: NAKSHATRAS },
  phone:    { type: String },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  pooja:        { type: mongoose.Schema.Types.ObjectId, ref: 'Pooja', required: true },
  poojaName:    { type: String, required: true },
  extraPoojas:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pooja' }],
  extraPoojaNames: [{ type: String }],
  bookedDate:   { type: Date, required: true },
  devotees:     { type: [devoteeSchema], required: true },
  contactName:  { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String, required: true },
  amount:       { type: Number, required: true },
  paymentStatus:{ type: String, enum: ['pending','paid','pay_at_temple','failed'], default: 'pending' },
  paymentMethod:{ type: String, enum: ['online','pay_at_temple','cash','upi','card','cheque'] },
  stripePaymentIntentId: { type: String },
  notes:        { type: String },
  status:       { type: String, enum: ['confirmed','cancelled','completed'], default: 'confirmed' },
  deity:        { type: mongoose.Schema.Types.ObjectId, ref: 'Deity' },
  deityName:    { type: String },
  bookingSource:{ type: String, enum: ['online','offline'], default: 'online' },
  collectedBy:  { type: String },
  receiptNumber:{ type: String },
}, { timestamps: true });

export default mongoose.model('PoojaBooking', bookingSchema);
