const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục nếu chưa có
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    if (req.baseUrl.includes('feedbacks')) folder += 'feedbacks';
    else if (req.baseUrl.includes('assignments')) {
      if (req.path.includes('submit')) folder += 'submissions';
      else folder += 'assignments';
    }
    else if (req.baseUrl.includes('resources')) folder += 'resources';
    else folder += 'others';
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
module.exports = upload;