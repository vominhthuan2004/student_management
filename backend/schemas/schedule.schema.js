const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  },
  subject: String,
  teacher: String,
  dayOfWeek: String,
  startTime: String,
  endTime: String,
  room: String
});

module.exports = mongoose.model("Schedule", scheduleSchema);