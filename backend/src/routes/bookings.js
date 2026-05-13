import { Router } from 'express';
import Stripe from 'stripe';
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

async function notify(booking) {
  try {
    await Promise.allSettled([
      sendBookingNotificationEmail(booking),
      sendBookingConfirmationEmail(booking),
      sendAdminSmsNotification(booking),
      sendUserSmsConfirmation(booking),
    ]);
  } catch (e) { logger.warn('Notification error', { error: e.message }); }
}

router.post('/', async (req, res, next) => {
  try {
    const { poojaId, extraPoojaIds = [], bookedDate, devotees, contactName, contactEmail, contactPhone, paymentMethod, notes, deityId, deityName } = req.body;

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
      amount: totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'pay_at_temple' ? 'pay_at_temple' : 'pending',
      notes,
      bookingSource: 'online',
    };
    if (deityId) bookingData.deity = deityId;
    if (deityName) bookingData.deityName = deityName;

    const booking = await PoojaBooking.create(bookingData);

    if (paymentMethod === 'pay_at_temple') {
      await notify(booking);
      return res.status(201).json({ booking, paymentStatus: 'pay_at_temple' });
    }

    // Stripe online payment
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'inr',
      metadata: { bookingId: booking._id.toString() },
    });

    booking.stripePaymentIntentId = intent.id;
    await booking.save();

    res.status(201).json({ booking, clientSecret: intent.client_secret });
  } catch (err) { next(err); }
});

router.post('/confirm-payment', async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const booking = await PoojaBooking.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = 'paid';
    await booking.save();

    await notify(booking);
    res.json({ booking });
  } catch (err) { next(err); }
});

export default router;
