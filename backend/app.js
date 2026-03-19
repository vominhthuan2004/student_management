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

app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/users", userRoutes);

module.exports = app;