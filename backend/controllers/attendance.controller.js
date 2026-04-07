const Attendance = require("../schemas/attendance.schema");
const attendanceSessionSchema = require("../schemas/attendanceSession.schema");

const Class = require("../schemas/class.schema");

const AttendanceSession = require("../schemas/attendanceSession.schema");


exports.createAttendance = async (req, res) => {
  try {

    const attendance = new Attendance(req.body);

    const result = await attendance.save();

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};


exports.getAllAttendance = async (req, res) => {
  try {

    const attendances = await Attendance.find()
      .populate("studentId")
      .populate("classId");

    res.json(attendances);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};


exports.getAttendanceById = async (req, res) => {
  try {

    const attendance = await Attendance.findById(req.params.id)
      .populate("studentId")
      .populate("classId");

    res.json(attendance);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};


exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteAttendance = async (req, res) => {
  try {

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({ message: "Attendance deleted" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};


exports.getMyAttendance = async (req, res) => {
  try {
    const attendances = await Attendance.find({
      studentId: req.user.studentId
    })
      .populate("studentId")
      .populate("classId");

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    let query = { classId };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const attendances = await Attendance.find(query).populate('studentId', 'fullName studentCode');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAttendanceByDate = async (req, res) => {
  try {
    const attendances = await Attendance.find({
      date: req.params.date
    })
      .populate("studentId")
      .populate("classId");

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAttendanceStatistics = async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}


exports.createSession = async (req, res) => {
  try {
    const { classId, expiryMinutes = 5 } = req.body;
    const teacherId = req.user.userId;

   
    const classItem = await Class.findById(classId);
    if (!classItem) return res.status(404).json({ message: 'Lớp không tồn tại' });
    if (classItem.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Bạn không phải giáo viên của lớp này' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

    const session = new AttendanceSession({ classId, code, expiresAt });
    await session.save();

    res.json({ message: 'Tạo mã thành công', code, expiresAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.manualAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceList } = req.body; // attendanceList: [{ studentId, status }]
    const teacherId = req.user.userId;

    // Kiểm tra quyền
    const classItem = await Class.findById(classId);
    if (!classItem) return res.status(404).json({ message: 'Lớp không tồn tại' });
    if (classItem.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Bạn không phải giáo viên của lớp này' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // đầu ngày
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    
    const bulkOps = attendanceList.map(item => ({
      updateOne: {
        filter: { 
          studentId: item.studentId, 
          classId, 
          date: { $gte: attendanceDate, $lt: nextDay }
        },
        update: { 
          $set: { 
            status: item.status,
            date: attendanceDate,  
          } 
        },
        upsert: true
      }
    }));


    await Attendance.bulkWrite(bulkOps);
    res.json({ message: 'Điểm danh thủ công thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.checkin = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user.studentId;
    if (!studentId) return res.status(400).json({ message: 'Không phải student' });

    
    const session = await AttendanceSession.findOne({
      code,
      expiresAt: { $gt: new Date() }
    });
    if (!session) return res.status(400).json({ message: 'Mã không hợp lệ hoặc đã hết hạn' });

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Attendance.findOne({
      studentId,
      classId: session.classId,
      date: { $gte: today, $lt: tomorrow }
    });
    if (existing) return res.status(400).json({ message: 'Bạn đã điểm danh hôm nay' });

    const attendance = new Attendance({
      studentId,
      classId: session.classId,
      code,
      date: new Date(),
      status: 'present'
    });
    await attendance.save();

    res.json({ message: 'Check-in thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
