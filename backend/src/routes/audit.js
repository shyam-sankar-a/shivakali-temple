import { Router } from 'express';
import { adminOnly } from '../middleware/auth.js';
import PoojaBooking from '../models/PoojaBooking.js';
import Donation from '../models/Donation.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = Router();
router.use(adminOnly);

function buildDateRange(query) {
  const { from, to, period } = query;
  let start, end;

  if (from || to) {
    start = from ? new Date(from) : new Date('2000-01-01');
    end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
  } else if (period) {
    const now = new Date();
    switch (period) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'quarterly': {
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
        end = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
        break;
      }
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
}

// GET /audit/summary
router.get('/summary', async (req, res, next) => {
  try {
    const { start, end } = buildDateRange(req.query);
    const dateFilter = { createdAt: { $gte: start, $lte: end } };
    const paidBookingFilter = { ...dateFilter, paymentStatus: { $in: ['paid', 'pay_at_temple'] } };
    const paidDonationFilter = { ...dateFilter, paymentStatus: 'paid' };

    const [bookings, donations] = await Promise.all([
      PoojaBooking.find(paidBookingFilter).lean(),
      Donation.find(paidDonationFilter).lean(),
    ]);

    const poojaRevenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);
    const donationRevenue = donations.reduce((s, d) => s + (d.amount || 0), 0);

    // By deity
    const deityMap = {};
    for (const b of bookings) {
      const key = b.deityName || 'Unspecified';
      if (!deityMap[key]) deityMap[key] = { deity: key, count: 0, revenue: 0 };
      deityMap[key].count++;
      deityMap[key].revenue += b.amount || 0;
    }

    // By pooja
    const poojaMap = {};
    for (const b of bookings) {
      const key = b.poojaName || 'Unknown';
      if (!poojaMap[key]) poojaMap[key] = { name: key, count: 0, revenue: 0 };
      poojaMap[key].count++;
      poojaMap[key].revenue += b.amount || 0;
    }

    // By payment method (bookings + donations)
    const pmMap = {};
    for (const b of bookings) {
      const key = b.paymentMethod || 'unknown';
      if (!pmMap[key]) pmMap[key] = { method: key, count: 0, revenue: 0 };
      pmMap[key].count++;
      pmMap[key].revenue += b.amount || 0;
    }
    for (const d of donations) {
      const key = d.paymentMethod || 'unknown';
      if (!pmMap[key]) pmMap[key] = { method: key, count: 0, revenue: 0 };
      pmMap[key].count++;
      pmMap[key].revenue += d.amount || 0;
    }

    // Daily revenue
    const dailyMap = {};
    for (const b of bookings) {
      const date = new Date(b.createdAt).toISOString().split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = { date, poojaRevenue: 0, donationRevenue: 0 };
      dailyMap[date].poojaRevenue += b.amount || 0;
    }
    for (const d of donations) {
      const date = new Date(d.createdAt).toISOString().split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = { date, poojaRevenue: 0, donationRevenue: 0 };
      dailyMap[date].donationRevenue += d.amount || 0;
    }

    const onlineBookings = bookings.filter(b => b.bookingSource === 'online').length;
    const offlineBookings = bookings.filter(b => b.bookingSource === 'offline').length;

    res.json({
      poojaRevenue,
      donationRevenue,
      totalRevenue: poojaRevenue + donationRevenue,
      totalBookings: bookings.length,
      totalDonations: donations.length,
      onlineBookings,
      offlineBookings,
      byDeity: Object.values(deityMap).sort((a, b) => b.revenue - a.revenue),
      byPooja: Object.values(poojaMap).sort((a, b) => b.revenue - a.revenue),
      byPaymentMethod: Object.values(pmMap).sort((a, b) => b.revenue - a.revenue),
      dailyRevenue: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) { next(err); }
});

// GET /audit/bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const { start, end } = buildDateRange(req.query);
    const bookings = await PoojaBooking.find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .populate('pooja', 'name')
      .lean();
    res.json(bookings);
  } catch (err) { next(err); }
});

// GET /audit/donations
router.get('/donations', async (req, res, next) => {
  try {
    const { start, end } = buildDateRange(req.query);
    const donations = await Donation.find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(donations);
  } catch (err) { next(err); }
});

// GET /audit/export/excel
router.get('/export/excel', async (req, res, next) => {
  try {
    const { start, end } = buildDateRange(req.query);
    const type = req.query.type || 'combined';
    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    const [bookings, donations] = await Promise.all([
      type !== 'donations' ? PoojaBooking.find(dateFilter).sort({ createdAt: 1 }).lean() : Promise.resolve([]),
      type !== 'bookings' ? Donation.find(dateFilter).sort({ createdAt: 1 }).lean() : Promise.resolve([]),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Shivakali Temple';
    workbook.created = new Date();

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      },
    };

    const addSheet = (name, rows, columns) => {
      const sheet = workbook.addWorksheet(name);
      sheet.columns = columns;
      const headerRow = sheet.getRow(1);
      columns.forEach((col, i) => {
        headerRow.getCell(i + 1).value = col.header;
        Object.assign(headerRow.getCell(i + 1), headerStyle);
      });
      headerRow.commit();
      rows.forEach(row => sheet.addRow(row));
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
    };

    const bookingCols = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Receipt No', key: 'receipt', width: 20 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Name', key: 'name', width: 22 },
      { header: 'Pooja', key: 'pooja', width: 18 },
      { header: 'Deity', key: 'deity', width: 16 },
      { header: 'Amount (₹)', key: 'amount', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Collected By', key: 'collectedBy', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    const donationCols = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Receipt No', key: 'receipt', width: 20 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Donor Name', key: 'name', width: 22 },
      { header: 'Purpose', key: 'purpose', width: 20 },
      { header: 'Amount (₹)', key: 'amount', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Collected By', key: 'collectedBy', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    const combinedCols = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Receipt No', key: 'receipt', width: 20 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Name', key: 'name', width: 22 },
      { header: 'Deity / Purpose', key: 'deityPurpose', width: 20 },
      { header: 'Amount (₹)', key: 'amount', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Collected By', key: 'collectedBy', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN') : '';

    if (type === 'bookings') {
      addSheet('Bookings', bookings.map(b => ({
        date: fmtDate(b.createdAt),
        receipt: b.receiptNumber || '',
        type: 'Pooja',
        name: b.contactName,
        pooja: b.poojaName,
        deity: b.deityName || '',
        amount: b.amount,
        paymentMethod: b.paymentMethod,
        source: b.bookingSource,
        collectedBy: b.collectedBy || '',
        status: b.paymentStatus,
      })), bookingCols);
    } else if (type === 'donations') {
      addSheet('Donations', donations.map(d => ({
        date: fmtDate(d.createdAt),
        receipt: d.receiptNumber || '',
        type: 'Donation',
        name: d.donorName,
        purpose: d.purpose,
        amount: d.amount,
        paymentMethod: d.paymentMethod,
        source: d.bookingSource,
        collectedBy: d.collectedBy || '',
        status: d.paymentStatus,
      })), donationCols);
    } else {
      // Combined
      const rows = [
        ...bookings.map(b => ({
          date: fmtDate(b.createdAt),
          receipt: b.receiptNumber || '',
          type: 'Pooja',
          name: b.contactName,
          deityPurpose: b.deityName || b.poojaName || '',
          amount: b.amount,
          paymentMethod: b.paymentMethod,
          source: b.bookingSource,
          collectedBy: b.collectedBy || '',
          status: b.paymentStatus,
        })),
        ...donations.map(d => ({
          date: fmtDate(d.createdAt),
          receipt: d.receiptNumber || '',
          type: 'Donation',
          name: d.donorName,
          deityPurpose: d.purpose,
          amount: d.amount,
          paymentMethod: d.paymentMethod,
          source: d.bookingSource,
          collectedBy: d.collectedBy || '',
          status: d.paymentStatus,
        })),
      ];
      rows.sort((a, b) => a.date.localeCompare(b.date));
      addSheet('Combined', rows, combinedCols);
      addSheet('Bookings', bookings.map(b => ({
        date: fmtDate(b.createdAt),
        receipt: b.receiptNumber || '',
        type: 'Pooja',
        name: b.contactName,
        pooja: b.poojaName,
        deity: b.deityName || '',
        amount: b.amount,
        paymentMethod: b.paymentMethod,
        source: b.bookingSource,
        collectedBy: b.collectedBy || '',
        status: b.paymentStatus,
      })), bookingCols);
      addSheet('Donations', donations.map(d => ({
        date: fmtDate(d.createdAt),
        receipt: d.receiptNumber || '',
        type: 'Donation',
        name: d.donorName,
        purpose: d.purpose,
        amount: d.amount,
        paymentMethod: d.paymentMethod,
        source: d.bookingSource,
        collectedBy: d.collectedBy || '',
        status: d.paymentStatus,
      })), donationCols);
    }

    const fromStr = start.toLocaleDateString('en-IN');
    const toStr = end.toLocaleDateString('en-IN');
    const filename = `temple-audit-${fromStr.replace(/\//g, '-')}-to-${toStr.replace(/\//g, '-')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

// GET /audit/export/pdf
router.get('/export/pdf', async (req, res, next) => {
  try {
    const { start, end } = buildDateRange(req.query);
    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    const [bookings, donations] = await Promise.all([
      PoojaBooking.find(dateFilter).sort({ createdAt: 1 }).lean(),
      Donation.find(dateFilter).sort({ createdAt: 1 }).lean(),
    ]);

    const poojaRevenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);
    const donationRevenue = donations.reduce((s, d) => s + (d.amount || 0), 0);

    const fromStr = start.toLocaleDateString('en-IN');
    const toStr = end.toLocaleDateString('en-IN');
    const filename = `temple-audit-${fromStr.replace(/\//g, '-')}-to-${toStr.replace(/\//g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    const crimson = '#C0392B';
    const gold = '#B48C0B';
    const darkGrey = '#333333';
    const lightGrey = '#F5F5F5';
    const W = 495; // usable width

    // Header
    doc.rect(50, 50, W, 60).fill(crimson);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18)
      .text('Shivakali Amba Bhagavathi Temple', 60, 64);
    doc.fontSize(10).font('Helvetica')
      .text('Finance & Audit Report', 60, 87);
    doc.fillColor(darkGrey).moveDown(2);

    // Period info
    doc.y = 125;
    doc.fontSize(10).font('Helvetica')
      .fillColor(darkGrey)
      .text(`Period: ${fromStr} to ${toStr}`, 50)
      .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 50)
      .moveDown(1);

    // Summary table
    doc.fontSize(13).font('Helvetica-Bold').fillColor(crimson).text('Revenue Summary', 50);
    doc.moveDown(0.4);

    const summaryRows = [
      ['Pooja Revenue', `₹${poojaRevenue.toLocaleString('en-IN')}`],
      ['Donation Revenue', `₹${donationRevenue.toLocaleString('en-IN')}`],
      ['Total Revenue', `₹${(poojaRevenue + donationRevenue).toLocaleString('en-IN')}`],
      ['Total Bookings', String(bookings.length)],
      ['Total Donations', String(donations.length)],
      ['Online Bookings', String(bookings.filter(b => b.bookingSource === 'online').length)],
      ['Offline Bookings', String(bookings.filter(b => b.bookingSource === 'offline').length)],
    ];

    let y = doc.y;
    summaryRows.forEach((row, i) => {
      const rowY = y + i * 22;
      if (i % 2 === 0) doc.rect(50, rowY, W, 22).fill(lightGrey);
      doc.fillColor(darkGrey).font('Helvetica').fontSize(10)
        .text(row[0], 60, rowY + 6, { width: 250 });
      doc.font('Helvetica-Bold').text(row[1], 310, rowY + 6, { width: 230, align: 'right' });
    });

    doc.y = y + summaryRows.length * 22 + 20;
    doc.moveDown(1);

    // Transactions table header helper
    const drawTableHeader = (cols, y) => {
      doc.rect(50, y, W, 20).fill(crimson);
      let x = 50;
      cols.forEach(col => {
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
          .text(col.label, x + 3, y + 6, { width: col.w - 6 });
        x += col.w;
      });
    };

    // Bookings section
    if (bookings.length > 0) {
      if (doc.y > 650) doc.addPage();
      doc.fontSize(13).font('Helvetica-Bold').fillColor(crimson).text('Pooja Bookings', 50);
      doc.moveDown(0.4);

      const bCols = [
        { label: 'Date', w: 70 },
        { label: 'Receipt', w: 90 },
        { label: 'Contact', w: 110 },
        { label: 'Pooja', w: 90 },
        { label: 'Deity', w: 70 },
        { label: 'Amount', w: 65 },
      ];
      const startY = doc.y;
      drawTableHeader(bCols, startY);
      let rowY = startY + 20;

      bookings.slice(0, 50).forEach((b, i) => {
        if (rowY > 730) { doc.addPage(); rowY = 50; drawTableHeader(bCols, rowY); rowY += 20; }
        if (i % 2 === 0) doc.rect(50, rowY, W, 18).fill('#FFF9F5');
        const vals = [
          new Date(b.createdAt).toLocaleDateString('en-IN'),
          b.receiptNumber || '-',
          b.contactName || '',
          b.poojaName || '',
          b.deityName || '-',
          `₹${(b.amount || 0).toLocaleString('en-IN')}`,
        ];
        let x = 50;
        bCols.forEach((col, ci) => {
          doc.fillColor(darkGrey).font('Helvetica').fontSize(8)
            .text(vals[ci], x + 3, rowY + 5, { width: col.w - 6 });
          x += col.w;
        });
        rowY += 18;
      });

      if (bookings.length > 50) {
        doc.y = rowY + 4;
        doc.fontSize(8).fillColor(gold).text(`... and ${bookings.length - 50} more bookings`, 50);
      }

      doc.y = rowY + 10;
    }

    // Donations section
    if (donations.length > 0) {
      if (doc.y > 650) doc.addPage();
      doc.moveDown(1);
      doc.fontSize(13).font('Helvetica-Bold').fillColor(crimson).text('Donations', 50);
      doc.moveDown(0.4);

      const dCols = [
        { label: 'Date', w: 70 },
        { label: 'Receipt', w: 90 },
        { label: 'Donor', w: 120 },
        { label: 'Purpose', w: 100 },
        { label: 'Method', w: 70 },
        { label: 'Amount', w: 45 },
      ];
      const startY = doc.y;
      drawTableHeader(dCols, startY);
      let rowY = startY + 20;

      donations.slice(0, 50).forEach((d, i) => {
        if (rowY > 730) { doc.addPage(); rowY = 50; drawTableHeader(dCols, rowY); rowY += 20; }
        if (i % 2 === 0) doc.rect(50, rowY, W, 18).fill('#FFF9F5');
        const vals = [
          new Date(d.createdAt).toLocaleDateString('en-IN'),
          d.receiptNumber || '-',
          d.donorName || '',
          d.purpose || '',
          d.paymentMethod || '',
          `₹${(d.amount || 0).toLocaleString('en-IN')}`,
        ];
        let x = 50;
        dCols.forEach((col, ci) => {
          doc.fillColor(darkGrey).font('Helvetica').fontSize(8)
            .text(vals[ci], x + 3, rowY + 5, { width: col.w - 6 });
          x += col.w;
        });
        rowY += 18;
      });

      if (donations.length > 50) {
        doc.y = rowY + 4;
        doc.fontSize(8).fillColor(gold).text(`... and ${donations.length - 50} more donations`, 50);
      }

      doc.y = rowY + 10;
    }

    // Footer on all pages
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.fontSize(8).fillColor('#999999')
        .text('Shivakali Amba Bhagavathi Temple — Confidential', 50, 800, { align: 'center', width: W });
    }

    doc.end();
  } catch (err) { next(err); }
});

export default router;
