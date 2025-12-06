const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
const uploadDir = path.join(__dirname, '../../uploads/userAvatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: user-ID-timestamp.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

module.exports = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Limit to 2MB
});