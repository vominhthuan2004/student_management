const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { validateSchedule } = require('../validations/schedule.validation');
const validate = require('../validations/validate');

// Public (hoặc verify tùy)
router.get('/class/:classId', scheduleController.getScheduleByClass);
router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);

// Admin routes
router.post('/', verifyToken,isAdmin, validateSchedule, validate, scheduleController.createSchedule);
router.put('/:id', verifyToken, isAdmin, validateSchedule, validate, scheduleController.updateSchedule);
router.delete('/:id', verifyToken, isAdmin, scheduleController.deleteSchedule);

module.exports = router;