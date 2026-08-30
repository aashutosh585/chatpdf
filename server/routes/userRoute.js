import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import { store } from '../controller/store.js';
import { chat } from '../controller/chatController.js';
import { upload } from '../config/multer.js';
import Pdf from '../models/pdf.js';
import { Pinecone } from '@pinecone-database/pinecone';

const router = express.Router();

// User profile route
router.get('/profile', isAuth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Upload and vectorize PDF
router.post('/uploadpdf', upload.single('pdf'), isAuth, store);

// Chat with PDF
router.post('/chat', isAuth, chat);

// List all user's PDFs
router.get('/pdfs', isAuth, async (req, res) => {
    try {
        const pdfs = await Pdf.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, pdfs });
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch PDFs' });
    }
});

// Delete a PDF and its Pinecone vector namespace
router.delete('/pdfs/:pdfId', isAuth, async (req, res) => {
    try {
        const { pdfId } = req.params;
        const userId = req.user._id;

        const pdfDoc = await Pdf.findOne({ userId, pdfId });
        if (!pdfDoc) {
            return res.status(404).json({ success: false, message: 'PDF not found or unauthorized' });
        }

        // Delete Pinecone vectors for this document namespace
        try {
            const pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY,
            });
            const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
            if (pdfDoc.namespace) {
                console.log(`Deleting Pinecone namespace: ${pdfDoc.namespace}`);
                await pineconeIndex.namespace(pdfDoc.namespace).deleteAll();
            }
        } catch (pineconeError) {
            console.warn(`Could not clear Pinecone namespace (${pdfDoc.namespace}):`, pineconeError.message);
        }

        // Delete MongoDB record
        await Pdf.deleteOne({ _id: pdfDoc._id });

        res.json({
            success: true,
            message: 'PDF and associated vectors deleted successfully',
            pdfId
        });
    } catch (error) {
        console.error('Error deleting PDF:', error);
        res.status(500).json({ success: false, message: 'Failed to delete PDF', error: error.message });
    }
});

export default router;
