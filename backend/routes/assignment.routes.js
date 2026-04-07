const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../utils/upload');


router.post('/', verifyToken, upload.array('attachments', 5), assignmentController.createAssignment);


router.post('/:assignmentId/submit', verifyToken, upload.single('file'), assignmentController.submitAssignment);


router.put('/:assignmentId/submissions/:submissionId/grade', verifyToken, assignmentController.gradeSubmission);


router.get('/class/:classId', verifyToken, assignmentController.getAssignmentsByClass);


router.get('/:assignmentId', verifyToken, assignmentController.getAssignmentDetail);


router.delete('/:assignmentId', verifyToken, assignmentController.deleteAssignment);

router.get('/:assignmentId/submissions', verifyToken, assignmentController.getSubmittedStudents);

router.get('/my/assignments', verifyToken, assignmentController.getMyAssignments);

module.exports = router;