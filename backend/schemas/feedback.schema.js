const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }], // đường dẫn file ảnh/tài liệu đính kèm
  status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
  reply: { type: String, default: '' },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);