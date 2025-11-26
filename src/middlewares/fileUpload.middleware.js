const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads/productImages');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      return cb(new Error('Only images are allowed (png, jpg, jpeg, webp)'));
    }
    cb(null, true);
  },
});

module.exports = upload;
