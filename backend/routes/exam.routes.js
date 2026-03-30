const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { validateExam } = require('../validations/exam.validation');
const validate = require('../validations/validate');

router.get('/class/:classId', examController.getExamsByClass);
router.get('/', examController.getAllExams);
router.get('/:id', examController.getExamById);
// admin sửa/xóa exam

router.post('/', verifyToken, validateExam, validate, examController.createExam);
router.put('/:id', verifyToken, isAdmin, validateExam, validate, examController.updateExam);
router.delete('/:id', verifyToken, isAdmin, examController.deleteExam);

module.exports = router;