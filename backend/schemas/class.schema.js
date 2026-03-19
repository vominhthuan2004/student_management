const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  classCode: {
    type: String,
    required: true,
    unique: true
  },
  className: {
    type: String,
    required: true
  },
  major: {
    type: String
  },
  year: {
    type: Number
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",          
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("classes", ClassSchema);