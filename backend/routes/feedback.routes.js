const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../utils/upload'); 


router.post('/', verifyToken, upload.array('attachments', 5), feedbackController.createFeedback);


router.get('/class/:classId', verifyToken, feedbackController.getFeedbacksByClass);

router.get('/student/:studentId', verifyToken, feedbackController.getFeedbacksByStudent);

router.put('/:id/reply', verifyToken, feedbackController.replyFeedback);


router.delete('/:id', verifyToken, feedbackController.deleteFeedback);

module.exports = router;