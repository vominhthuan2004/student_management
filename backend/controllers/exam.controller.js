const Exam = require('../schemas/exam.schema');
const Class = require('../schemas/class.schema');

// Lấy lịch thi theo classId (cho sinh viên xem)
exports.getExamsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const exams = await Exam.find({ classId }).sort({ examDate: 1, startTime: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả exam (admin/teacher)
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('classId');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo exam
exports.createExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa exam
exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Lấy exam theo id (cho admin/teacher)
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('classId');
    if (!exam) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};