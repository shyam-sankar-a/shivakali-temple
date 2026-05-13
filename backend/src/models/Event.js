import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date },
  imageUrl:    { type: String },
  isHighlight: { type: Boolean, default: false },
  isVisible:   { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
