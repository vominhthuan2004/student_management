const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  },
  subject: String,
  examDate: Date,
  room: String
});

module.exports = mongoose.model("Exam", examSchema);