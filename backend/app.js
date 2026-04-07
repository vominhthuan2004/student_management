const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/database");


const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const studentRoutes = require("./routes/student.routes");
const classRoutes = require("./routes/class.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const userRoutes = require("./routes/user.route");
const scheduleRoutes = require('./routes/schedule.routes');
const examRoutes = require('./routes/exam.routes');
const resourceRoutes = require('./routes/resource.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const gradeRoutes = require('./routes/grade.routes');


app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/grades', gradeRoutes);
module.exports = app;