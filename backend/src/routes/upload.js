import { Router } from 'express';
import multer from 'multer';
import { adminOnly } from '../middleware/auth.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post('/', adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const folder = req.body.folder || 'temple';
    const result = await uploadImage(req.file.buffer, folder);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete('/', adminOnly, async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId required' });
    await deleteImage(publicId);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
