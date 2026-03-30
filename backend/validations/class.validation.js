const { body } = require('express-validator');
const Class = require('../schemas/class.schema'); 

exports.validateClass = [
  body('classCode')
    .notEmpty().withMessage('Mã lớp không được để trống')
    .isLength({ min: 2 }).withMessage('Mã lớp phải có ít nhất 2 ký tự')
    .custom(async (value, { req }) => {
      const existing = await Class.findOne({ classCode: value });
      if (existing && (!req.params.id || existing._id.toString() !== req.params.id)) {
        throw new Error('Mã lớp đã tồn tại');
      }
      return true;
    }),
  body('className')
    .notEmpty().withMessage('Tên lớp không được để trống'),
  body('major')
    .optional(),
  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Năm học không hợp lệ'),
  body('teacherId')
    .optional()
    .isMongoId().withMessage('ID giáo viên không hợp lệ')
];