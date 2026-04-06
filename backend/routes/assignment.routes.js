const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../utils/upload');

// Tạo bài tập (teacher) – upload nhiều file đính kèm
router.post('/', verifyToken, upload.array('attachments', 5), assignmentController.createAssignment);

// Nộp bài (student) – upload một filex
router.post('/:assignmentId/submit', verifyToken, upload.single('file'), assignmentController.submitAssignment);

// Chấm điểm (teacher)
router.put('/:assignmentId/submissions/:submissionId/grade', verifyToken, assignmentController.gradeSubmission);

// Lấy danh sách bài tập theo lớp
router.get('/class/:classId', verifyToken, assignmentController.getAssignmentsByClass);

// Lấy chi tiết bài tập (kèm bài nộp)
router.get('/:assignmentId', verifyToken, assignmentController.getAssignmentDetail);

// Xóa bài tập
router.delete('/:assignmentId', verifyToken, assignmentController.deleteAssignment);

router.get('/:assignmentId/submissions', verifyToken, assignmentController.getSubmittedStudents);
// Lấy bài tập của sinh viên (dùng cho student dashboard)
router.get('/my/assignments', verifyToken, assignmentController.getMyAssignments);

module.exports = router;