const Schedule = require('../schemas/schedule.schema');
const Class = require('../schemas/class.schema');


exports.getScheduleByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const schedule = await Schedule.find({ classId }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('classId');
    if (!schedule) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('classId');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
