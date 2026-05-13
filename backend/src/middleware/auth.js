import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorised' });
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function adminOnly(req, res, next) {
  authenticate(req, res, async () => {
    try {
      const user = await User.findById(req.user.id).select('role adminStatus');
      if (!user || !['admin', 'superadmin'].includes(user.role)) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      if (user.adminStatus === 'inactive') {
        return res.status(403).json({ message: 'Account is inactive' });
      }
      req.user.role = user.role;
      next();
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  });
}

export function superAdminOnly(req, res, next) {
  adminOnly(req, res, () => {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Superadmin access required' });
    }
    next();
  });
}
