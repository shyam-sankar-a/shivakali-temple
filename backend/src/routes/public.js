import { Router } from 'express';
import Pooja from '../models/Pooja.js';
import GalleryImage from '../models/GalleryImage.js';
import Employee from '../models/Employee.js';
import Event from '../models/Event.js';
import TempleInfo from '../models/TempleInfo.js';
import Deity from '../models/Deity.js';

const router = Router();

router.get('/poojas', async (req, res, next) => {
  try {
    const poojas = await Pooja.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json(poojas);
  } catch (err) { next(err); }
});

router.get('/gallery', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isVisible: true };
    if (category) filter.category = category;
    const images = await GalleryImage.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(images);
  } catch (err) { next(err); }
});

router.get('/employees', async (req, res, next) => {
  try {
    const employees = await Employee.find({ isVisible: true }).sort({ sortOrder: 1 });
    res.json(employees);
  } catch (err) { next(err); }
});

router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find({ isVisible: true }).sort({ startDate: 1 });
    res.json(events);
  } catch (err) { next(err); }
});

router.get('/temple-info', async (req, res, next) => {
  try {
    const docs = await TempleInfo.find({});
    const info = Object.fromEntries(docs.map(d => [d.key, d.value]));
    res.json(info);
  } catch (err) { next(err); }
});

router.get('/deities', async (req, res, next) => {
  try {
    const deities = await Deity.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json(deities);
  } catch (err) { next(err); }
});

export default router;
