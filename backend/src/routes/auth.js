import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();
const secret = () => process.env.JWT_SECRET || 'dev_secret';
const sign = (user) => jwt.sign({ id: user._id, role: user.role }, secret(), { expiresIn: '8h' });

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.adminStatus === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    const token = sign(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

router.post('/change-password', async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorised' });
    const payload = jwt.verify(auth.slice(7), secret());
    const user = await User.findById(payload.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { currentPassword, newPassword } = req.body;
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
});

export default router;
