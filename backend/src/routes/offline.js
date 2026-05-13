import { Router } from 'express';
import { adminOnly } from '../middleware/auth.js';
import Pooja from '../models/Pooja.js';
import PoojaBooking from '../models/PoojaBooking.js';
import {
  sendBookingNotificationEmail,
  sendBookingConfirmationEmail,
  sendAdminSmsNotification,
  sendUserSmsConfirmation,
} from '../utils/notifications.js';
import { logger } from '../utils/logger.js';

const router = Router();
router.use(adminOnly);

async function notify(booking) {
  try {
    await Promise.allSettled([
      sendBookingNotificationEmail(booking),
      sendBookingConfirmationEmail(booking),
      sendAdminSmsNotification(booking),
      sendUserSmsConfirmation(booking),
    ]);
  } catch (e) { logger.warn('Offline booking notification error', { error: e.message }); }
}

async function generateReceiptNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const count = await PoojaBooking.countDocuments({
    bookingSource: 'offline',
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const seq = String(count + 1).padStart(5, '0');
  return `RCPT-${dateStr}-${seq}`;
}

router.post('/bookings', async (req, res, next) => {
  try {
    const {
      poojaId, extraPoojaIds = [], bookedDate, devotees,
      contactName, contactEmail, contactPhone,
      amount, notes,
      collectedBy, paymentMethod,
      deityId, deityName,
    } = req.body;

    const pooja = await Pooja.findById(poojaId);
    if (!pooja) return res.status(404).json({ message: 'Pooja not found' });

    let totalAmount = pooja.price;
    let extraPoojas = [];
    let extraPoojaNames = [];

    if (extraPoojaIds.length > 0) {
      const extras = await Pooja.find({ _id: { $in: extraPoojaIds } });
      extraPoojas = extras.map(p => p._id);
      extraPoojaNames = extras.map(p => p.name);
      totalAmount += extras.reduce((sum, p) => sum + p.price, 0);
    }

    const receiptNumber = await generateReceiptNumber();

    const bookingData = {
      pooja: pooja._id,
      poojaName: pooja.name,
      extraPoojas,
      extraPoojaNames,
      bookedDate: new Date(bookedDate),
      devotees,
      contactName,
      contactEmail,
      contactPhone,
      amount: amount ?? totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      notes,
      bookingSource: 'offline',
      collectedBy,
      receiptNumber,
    };
    if (deityId) bookingData.deity = deityId;
    if (deityName) bookingData.deityName = deityName;

    const booking = await PoojaBooking.create(bookingData);
    await notify(booking);

    res.status(201).json({ booking });
  } catch (err) { next(err); }
});

export default router;
