import { Router } from 'express';
import { adminOnly, superAdminOnly } from '../middleware/auth.js';
import { deleteImage } from '../utils/cloudinary.js';
import User from '../models/User.js';
import Pooja from '../models/Pooja.js';
import PoojaBooking from '../models/PoojaBooking.js';
import GalleryImage from '../models/GalleryImage.js';
import Employee from '../models/Employee.js';
import Event from '../models/Event.js';
import TempleInfo from '../models/TempleInfo.js';
import Deity from '../models/Deity.js';
import Donation from '../models/Donation.js';

const router = Router();
router.use(adminOnly);

// --- Stats ---
router.get('/stats', async (req, res, next) => {
  try {
    const [totalBookings, pendingBookings, totalPoojas, upcomingEvents] = await Promise.all([
      PoojaBooking.countDocuments(),
      PoojaBooking.countDocuments({ paymentStatus: 'pending' }),
      Pooja.countDocuments({ isActive: true }),
      Event.countDocuments({ startDate: { $gte: new Date() }, isVisible: true }),
    ]);
    res.json({ totalBookings, pendingBookings, totalPoojas, upcomingEvents });
  } catch (err) { next(err); }
});

// --- Bookings ---
router.get('/bookings', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.source) filter.bookingSource = req.query.source;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }
    const bookings = await PoojaBooking.find(filter).sort({ createdAt: -1 }).populate('pooja', 'name');
    res.json(bookings);
  } catch (err) { next(err); }
});

router.patch('/bookings/:id/status', async (req, res, next) => {
  try {
    const booking = await PoojaBooking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (err) { next(err); }
});

// --- Poojas ---
router.get('/poojas', async (req, res, next) => {
  try {
    const poojas = await Pooja.find().sort({ sortOrder: 1 });
    res.json(poojas);
  } catch (err) { next(err); }
});

router.post('/poojas', async (req, res, next) => {
  try {
    const pooja = await Pooja.create(req.body);
    res.status(201).json(pooja);
  } catch (err) { next(err); }
});

router.put('/poojas/:id', async (req, res, next) => {
  try {
    const pooja = await Pooja.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pooja);
  } catch (err) { next(err); }
});

router.delete('/poojas/:id', async (req, res, next) => {
  try {
    await Pooja.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// --- Gallery ---
router.get('/gallery', async (req, res, next) => {
  try {
    const images = await GalleryImage.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(images);
  } catch (err) { next(err); }
});

router.post('/gallery', async (req, res, next) => {
  try {
    const image = await GalleryImage.create(req.body);
    res.status(201).json(image);
  } catch (err) { next(err); }
});

router.put('/gallery/:id', async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(image);
  } catch (err) { next(err); }
});

router.delete('/gallery/:id', async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (image?.publicId) await deleteImage(image.publicId).catch(() => {});
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// --- Employees ---
router.get('/employees', async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ sortOrder: 1 });
    res.json(employees);
  } catch (err) { next(err); }
});

router.post('/employees', async (req, res, next) => {
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json(emp);
  } catch (err) { next(err); }
});

router.put('/employees/:id', async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(emp);
  } catch (err) { next(err); }
});

router.delete('/employees/:id', async (req, res, next) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// --- Events ---
router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find().sort({ startDate: 1 });
    res.json(events);
  } catch (err) { next(err); }
});

router.post('/events', async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) { next(err); }
});

router.put('/events/:id', async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) { next(err); }
});

router.delete('/events/:id', async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// --- Temple Info ---
router.get('/temple-info', async (req, res, next) => {
  try {
    const docs = await TempleInfo.find({});
    const info = Object.fromEntries(docs.map(d => [d.key, d.value]));
    res.json(info);
  } catch (err) { next(err); }
});

router.put('/temple-info', async (req, res, next) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await TempleInfo.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    }
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
});

// --- Deities ---
router.get('/deities', async (req, res, next) => {
  try {
    const deities = await Deity.find().sort({ sortOrder: 1, name: 1 });
    res.json(deities);
  } catch (err) { next(err); }
});

router.post('/deities', async (req, res, next) => {
  try {
    const deity = await Deity.create(req.body);
    res.status(201).json(deity);
  } catch (err) { next(err); }
});

router.put('/deities/:id', async (req, res, next) => {
  try {
    const deity = await Deity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(deity);
  } catch (err) { next(err); }
});

router.delete('/deities/:id', async (req, res, next) => {
  try {
    await Deity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// --- Donations ---
router.get('/donations', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.source) filter.bookingSource = req.query.source;
    if (req.query.status) filter.paymentStatus = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;
    const [donations, total] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Donation.countDocuments(filter),
    ]);
    res.json({ donations, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.post('/donations', async (req, res, next) => {
  try {
    const donation = await Donation.create(req.body);
    res.status(201).json(donation);
  } catch (err) { next(err); }
});

router.patch('/donations/:id/status', async (req, res, next) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.paymentStatus }, { new: true });
    res.json(donation);
  } catch (err) { next(err); }
});

// --- Admin users (superadmin only) ---
router.get('/users', superAdminOnly, async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'superadmin'] } }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

router.post('/users', superAdminOnly, async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body, role: 'admin' });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { next(err); }
});

router.patch('/users/:id/status', superAdminOnly, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { adminStatus: req.body.adminStatus }, { new: true });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
