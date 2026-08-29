import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    pdfId: {
        type: String,
        required: true
    },
    namespace: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can't have duplicate files with same name (optional, but good for lookup)
pdfSchema.index({ userId: 1, fileName: 1 });

const Pdf = mongoose.model('Pdf', pdfSchema);
export default Pdf;
