import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title:     { type: String },
  imageUrl:  { type: String, required: true },
  publicId:  { type: String },
  category:  { type: String, enum: ['festival','deity','temple','devotees','other'], default: 'other' },
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('GalleryImage', gallerySchema);
