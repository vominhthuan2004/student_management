const { body } = require('express-validator');
const Student = require('../schemas/student.schema');

exports.validateStudent = [
  body('studentCode')
    .notEmpty().withMessage('Mã sinh viên không được để trống')
    .isLength({ min: 3 }).withMessage('Mã sinh viên phải có ít nhất 3 ký tự')
    .custom(async (value, { req }) => {
      // Kiểm tra trùng lặp, bỏ qua nếu là update và studentCode không đổi
      const existing = await Student.findOne({ studentCode: value });
      if (existing && (!req.params.id || existing._id.toString() !== req.params.id)) {
        throw new Error('Mã sinh viên đã tồn tại');
      }
      return true;
    }),
  body('fullName')
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ min: 3 }).withMessage('Họ tên phải có ít nhất 3 ký tự'),
  body('email')
    .optional()
    .isEmail().withMessage('Email không hợp lệ'),
  body('phone')
    .optional()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/).withMessage('Số điện thoại không hợp lệ (10 số, đầu 03/05/07/08/09)'),
  body('classId')
    .notEmpty().withMessage('Lớp không được để trống')
    .isMongoId().withMessage('ID lớp không hợp lệ')
];