import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import { store } from '../controller/store.js';
import { chat } from '../controller/chatController.js';
import { upload } from '../config/multer.js';


const router = express.Router();


// Example user routes - add your specific routes here
router.get('/profile', isAuth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

router.post('/uploadpdf', upload.single('pdf'), isAuth, store);
router.post('/chat', isAuth, chat);
router.get('/pdfs', isAuth, async (req, res) => {
    try {
        const { default: Pdf } = await import('../models/pdf.js');
        const pdfs = await Pdf.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, pdfs });
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch PDFs' });
    }
});

export default router;
