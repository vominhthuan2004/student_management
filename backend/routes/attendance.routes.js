const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

const { verifyToken } = require("../middlewares/auth");

//student checkin for attendance and get my attendance
router.post("/checkin", verifyToken, attendanceController.checkin);

router.get("/my", verifyToken, attendanceController.getMyAttendance);

//Teacher routes for attendance
router.post("/generate-code",verifyToken, attendanceController.createSession);
router.post('/manual', verifyToken, attendanceController.manualAttendance);
router.get('/class/:classId', verifyToken, attendanceController.getAttendanceByClass);

//crud for attendance
router.post("/", attendanceController.createAttendance);

router.get("/", attendanceController.getAllAttendance);

router.get("/statistics", attendanceController.getAttendanceStatistics);

router.get("/:id", attendanceController.getAttendanceById);

router.put("/:id", attendanceController.updateAttendance);

router.delete("/:id", attendanceController.deleteAttendance);

router.get("/class/:classId", attendanceController.getAttendanceByClass);

router.get("/date/:date", attendanceController.getAttendanceByDate);



module.exports = router;