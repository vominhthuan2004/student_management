const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    studentCode: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classes"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("students", StudentSchema);