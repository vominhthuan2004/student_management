const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes', required: true },
  subject: { type: String, required: true },
  dayOfWeek: { type: Number, min: 2, max: 8 }, 
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true },
  room: { type: String },
  teacher: { type: String },
  createdAt: { type: Date, default: Date.now },
  date: {
    type: Date,
    default: Date.now   
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);