import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  description: { type: String },
  imageUrl:    { type: String },
  phone:       { type: String },
  email:       { type: String },
  isVisible:   { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
