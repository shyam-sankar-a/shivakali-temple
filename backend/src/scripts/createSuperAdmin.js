import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shivakali_temple';
await mongoose.connect(uri);

const existing = await User.findOne({ email: 'admin@shivakali.temple' });
if (existing) {
  console.log('Superadmin already exists.');
} else {
  await User.create({
    name: 'Super Admin',
    email: 'admin@shivakali.temple',
    password: 'Temple@1234',
    role: 'superadmin',
    adminStatus: 'active',
  });
  console.log('Superadmin created: admin@shivakali.temple / Temple@1234');
}

await mongoose.disconnect();
