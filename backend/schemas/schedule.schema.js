const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes', required: true },
  subject: { type: String, required: true },
  dayOfWeek: { type: Number, min: 2, max: 8 }, // 2: Thứ 2, 3: Thứ 3, ..., 8: Chủ nhật
  startTime: { type: String, required: true }, // "07:30"
  endTime: { type: String, required: true },
  room: { type: String },
  teacher: { type: String }, // có thể là tên giáo viên hoặc tham chiếu đến user
  createdAt: { type: Date, default: Date.now },
  date: {
    type: Date,
    default: Date.now   
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);