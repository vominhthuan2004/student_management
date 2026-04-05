const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../utils/upload'); // dùng chung cấu hình multer

// Student: gửi feedback (có thể kèm nhiều ảnh)
router.post('/', verifyToken, upload.array('attachments', 5), feedbackController.createFeedback);

// Teacher/Admin: xem feedback của lớp
router.get('/class/:classId', verifyToken, feedbackController.getFeedbacksByClass);

// Teacher/Admin: trả lời feedback
router.put('/:id/reply', verifyToken, feedbackController.replyFeedback);

// Xóa (admin hoặc student sở hữu)
router.delete('/:id', verifyToken, feedbackController.deleteFeedback);

module.exports = router;