const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/database");


const app = express();

app.use(cors());
app.use(express.json());

connectDB();
// routes
const studentRoutes = require("./routes/student.routes");
const classRoutes = require("./routes/class.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const userRoutes = require("./routes/user.route");
const scheduleRoutes = require('./routes/schedule.routes');
const examRoutes = require('./routes/exam.routes');

app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/exams', examRoutes);

module.exports = app;