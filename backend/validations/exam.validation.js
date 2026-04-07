const { body } = require('express-validator');

exports.validateExam = [
  body('classId')
    .notEmpty().withMessage('classId không được để trống')
    .isMongoId().withMessage('ID lớp không hợp lệ'),
  body('subject')
    .notEmpty().withMessage('Môn thi không được để trống'),
  body('examDate')
    .notEmpty().withMessage('Ngày thi không được để trống')
    .isISO8601().withMessage('Ngày thi không hợp lệ (YYYY-MM-DD)')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      if (selectedDate < today) {
        throw new Error('Ngày thi không thể trong quá khứ');
      }
      return true;
    }),
  body('startTime')
    .notEmpty().withMessage('Giờ bắt đầu không được để trống')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ bắt đầu không hợp lệ (HH:MM)'),
  body('endTime')
    .notEmpty().withMessage('Giờ kết thúc không được để trống')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ kết thúc không hợp lệ (HH:MM)'),
  body('room')
    .optional(),
  body('note')
    .optional()
];