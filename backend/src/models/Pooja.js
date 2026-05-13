import mongoose from 'mongoose';

const poojaSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  duration:    { type: String },
  price:       { type: Number, required: true },
  deity:       { type: String, enum: ['Kali', 'Durga', 'Both'], default: 'Both' },
  timings:     [String],
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Pooja', poojaSchema);
