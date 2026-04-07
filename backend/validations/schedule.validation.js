const { body } = require('express-validator');

exports.validateSchedule = [
    body('classId')
        .notEmpty().withMessage('classId không được để trống')
        .isMongoId().withMessage('ID lớp không hợp lệ'),
    body('subject')
        .notEmpty().withMessage('Môn học không được để trống'),
    body('dayOfWeek')
        .notEmpty().withMessage('Thứ không được để trống')
        .isInt({ min: 2, max: 8 }).withMessage('Thứ phải từ 2 (Thứ 2) đến 8 (Chủ nhật)'),
    body('startTime')
        .notEmpty().withMessage('Giờ bắt đầu không được để trống')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ bắt đầu không hợp lệ (HH:MM)'),
    body('endTime')
        .notEmpty().withMessage('Giờ kết thúc không được để trống')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ kết thúc không hợp lệ (HH:MM)'),
    body('room')
        .optional(),
    body('teacher')
        .optional(),
    body('date')
        .optional()  
        .isISO8601().withMessage('Ngày không hợp lệ')
        .custom((value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                throw new Error('Ngày học không thể trong quá khứ');
            }
            return true;
        })
];