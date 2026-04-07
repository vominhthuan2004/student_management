const Grade = require('../schemas/grade.schema');
const Student = require('../schemas/student.schema');
const XLSX = require('xlsx');
const fs = require('fs');


exports.createGrade = async (req, res) => {
  try {
    const { studentId, classId, assignmentName, score, maxScore, weight } = req.body;
    const gradedBy = req.user.userId;
    const grade = new Grade({ studentId, classId, assignmentName, score, maxScore, weight, gradedBy });
    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyGrades = async (req, res) => {
  try {
    const studentId = req.user.studentId; // từ token
    if (!studentId) {
      return res.status(400).json({ message: 'Không tìm thấy studentId' });
    }
    const grades = await Grade.find({ studentId }).populate('classId', 'className');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGradesByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.studentId;
    const grades = await Grade.find({ studentId }).populate('classId', 'className');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getGradesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const grades = await Grade.find({ classId }).populate('studentId', 'fullName studentCode');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateGrade = async (req, res) => {
  try {
    const { score } = req.body;
    const grade = await Grade.findByIdAndUpdate(req.params.id, { score }, { new: true });
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteGrade = async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.importGradesFromExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Chưa upload file' });
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const gradedBy = req.user.userId;
    const results = [];
    for (const row of data) {
      const student = await Student.findOne({ studentCode: row.studentCode });
      if (!student) continue;
      const grade = new Grade({
        studentId: student._id,
        classId: req.body.classId,
        assignmentName: row.assignmentName,
        score: row.score,
        maxScore: row.maxScore,
        weight: row.weight || 1,
        gradedBy
      });
      await grade.save();
      results.push(grade);
    }
    
    fs.unlinkSync(req.file.path);
    res.json({ message: `Đã import ${results.length} điểm`, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};