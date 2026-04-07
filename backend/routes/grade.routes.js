const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { verifyToken, isAdminOrTeacher } = require('../middlewares/auth');
const upload = require('../utils/upload');


router.get('/me', verifyToken, gradeController.getMyGrades);

router.get('/class/:classId', verifyToken, gradeController.getGradesByClass);

router.get('/student/:studentId', verifyToken, gradeController.getGradesByStudent);

router.post('/', verifyToken, gradeController.createGrade);

router.post('/import', verifyToken, upload.single('file'), gradeController.importGradesFromExcel);

router.put('/:id', verifyToken, gradeController.updateGrade);

router.delete('/:id', verifyToken, gradeController.deleteGrade);

module.exports = router;