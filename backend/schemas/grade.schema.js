const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'students', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  assignmentName: { type: String, required: true }, // tên cột điểm (ví dụ: "Kiểm tra giữa kỳ")
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, min: 0 },
  weight: { type: Number, default: 1 }, // trọng số (0-1 hoặc 0-100)
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gradedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grade', GradeSchema);