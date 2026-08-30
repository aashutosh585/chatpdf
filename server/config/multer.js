import multer from 'multer';

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB limit
    },
    fileFilter,
});