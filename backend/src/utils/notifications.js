import nodemailer from 'nodemailer';
import { logger } from './logger.js';

function createTransport() {
  const host = process.env.MAIL_HOST || 'localhost';
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: (Number(process.env.MAIL_PORT) || 587) === 465,
      auth: { user, pass },
    });
  }
  return nodemailer.createTransport({ host, port: Number(process.env.MAIL_PORT) || 1025, secure: false, ignoreTLS: true });
}

async function sendSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_FROM;
  if (!accountSid || !authToken || !from || !to) return;
  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(accountSid, authToken);
    await client.messages.create({ from, to, body });
  } catch (err) {
    logger.warn('SMS send failed', { to, error: err.message });
  }
}

export async function sendBookingNotificationEmail(booking) {
  const transport = createTransport();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const devoteeList = booking.devotees.map(d => `${d.name} (${d.nakshatra})`).join(', ');
  await transport.sendMail({
    from: process.env.MAIL_FROM || 'temple@shivakali.temple',
    to: adminEmail,
    subject: `New Pooja Booking — ${booking.poojaName}`,
    html: `
      <h2>New Pooja Booking</h2>
      <p><strong>Pooja:</strong> ${booking.poojaName}</p>
      <p><strong>Date:</strong> ${new Date(booking.bookedDate).toDateString()}</p>
      <p><strong>Devotees:</strong> ${devoteeList}</p>
      <p><strong>Contact:</strong> ${booking.contactName} | ${booking.contactEmail} | ${booking.contactPhone}</p>
      <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
      <p><strong>Amount:</strong> ₹${booking.amount}</p>
    `,
  });
}

export async function sendBookingConfirmationEmail(booking) {
  const transport = createTransport();
  if (!booking.contactEmail) return;

  const devoteeList = booking.devotees.map(d => `${d.name} (${d.nakshatra})`).join(', ');
  await transport.sendMail({
    from: process.env.MAIL_FROM || 'temple@shivakali.temple',
    to: booking.contactEmail,
    subject: `Booking Confirmed — ${booking.poojaName}`,
    html: `
      <h2>Your Pooja Booking is Confirmed</h2>
      <p>Dear ${booking.contactName},</p>
      <p>Your booking for <strong>${booking.poojaName}</strong> on <strong>${new Date(booking.bookedDate).toDateString()}</strong> has been confirmed.</p>
      <p><strong>Devotees:</strong> ${devoteeList}</p>
      <p><strong>Amount:</strong> ₹${booking.amount}</p>
      <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
      <br/>
      <p>May Goddess Shivakali Amba Bhagavathi bless you and your family.</p>
      <p><em>Shivakali Amba Bhagavathi Temple, Haripad</em></p>
    `,
  });
}

export async function sendAdminSmsNotification(booking) {
  const body =
    `New booking: ${booking.poojaName} on ${new Date(booking.bookedDate).toDateString()} ` +
    `by ${booking.contactName} (${booking.contactPhone}). Amount: ₹${booking.amount}`;
  await sendSms(process.env.ADMIN_PHONE, body);
}

export async function sendUserSmsConfirmation(booking) {
  if (!booking.contactPhone) return;
  const devoteeNames = booking.devotees.map(d => d.name).join(', ');
  const body =
    `Namaste ${booking.contactName}, your pooja booking is confirmed!\n` +
    `Pooja: ${booking.poojaName}\n` +
    `Date: ${new Date(booking.bookedDate).toDateString()}\n` +
    `Devotees: ${devoteeNames}\n` +
    `Amount: ₹${booking.amount} (${booking.paymentStatus})\n` +
    `- Shivakali Amba Bhagavathi Temple, Haripad`;
  await sendSms(booking.contactPhone, body);
}
