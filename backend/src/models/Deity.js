import mongoose from 'mongoose';

const deitySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  iconEmoji:   { type: String, default: '🙏' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Deity', deitySchema);
