const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { verifyToken, isAdminOrTeacher } = require('../middlewares/auth');
const upload = require('../utils/upload');

// Lấy điểm của chính mình (sinh viên)
router.get('/me', verifyToken, gradeController.getMyGrades);
// Lấy điểm theo lớp (giáo viên)
router.get('/class/:classId', verifyToken, gradeController.getGradesByClass);
// Lấy điểm theo studentId (giáo viên)
router.get('/student/:studentId', verifyToken, gradeController.getGradesByStudent);
// Tạo điểm thủ công
router.post('/', verifyToken, gradeController.createGrade);
// Import Excel
router.post('/import', verifyToken, upload.single('file'), gradeController.importGradesFromExcel);
// Cập nhật, xóa
router.put('/:id', verifyToken, gradeController.updateGrade);

router.delete('/:id', verifyToken, gradeController.deleteGrade);

module.exports = router;