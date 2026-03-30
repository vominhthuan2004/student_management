const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, // có thể null nếu là cột điểm riêng
  gradeName: { type: String, required: true }, // "Bài kiểm tra giữa kỳ", "Chuyên cần", "Đồ án"
  score: { type: Number, required: true },
  maxScore: { type: Number, default: 100 },
  weight: { type: Number, default: 1 }, // trọng số (nếu tính điểm trung bình)
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grade', gradeSchema);