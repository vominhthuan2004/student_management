const Assignment = require('../schemas/assignment.schema');
const Class = require('../schemas/class.schema');
const Student = require('../schemas/student.schema');
const Grade = require('../schemas/grade.schema');
const fs = require('fs');
const path = require('path');

// 1. Tạo bài tập (giáo viên) - upload file đính kèm (có thể nhiều file)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, classId, dueDate } = req.body;
    const teacherId = req.user.userId; // từ token

    // Kiểm tra giáo viên có phải chủ nhiệm lớp không (tuỳ chọn)
    const classItem = await Class.findById(classId);
    if (!classItem) return res.status(404).json({ message: 'Lớp không tồn tại' });
    if (classItem.teacherId && classItem.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Bạn không phải giáo viên của lớp này' });
    }

    // Lưu đường dẫn các file đính kèm (nếu có)
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => file.path);
    }

    const assignment = new Assignment({
      title,
      description,
      classId,
      teacherId,
      dueDate,
      attachments,
      submissions: []
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Sinh viên nộp bài (upload file)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.studentId; // từ token (sinh viên)
    if (!studentId) return res.status(400).json({ message: 'Chỉ sinh viên mới nộp được bài' });

    if (!req.file) return res.status(400).json({ message: 'Chưa có file bài nộp' });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Bài tập không tồn tại' });

    // Kiểm tra hạn nộp
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Đã quá hạn nộp bài' });
    }

    // Kiểm tra sinh viên đã nộp chưa (nếu muốn chỉ nộp một lần)
    const existing = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã nộp bài cho bài tập này rồi' });
    }

    // Thêm submission
    assignment.submissions.push({
      studentId,
      fileUrl: req.file.path,
      submittedAt: new Date()
    });
    await assignment.save();

    res.json({ message: 'Nộp bài thành công', submission: assignment.submissions[assignment.submissions.length - 1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Giáo viên chấm điểm một bài nộp
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;
    const teacherId = req.user.userId;

    // Tìm assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Bài tập không tồn tại' });

    // Kiểm tra quyền (giáo viên của lớp hoặc admin)
    if (assignment.teacherId.toString() !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền chấm bài' });
    }

    // Tìm submission cần chấm
    const submission = assignment.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp' });

    // Cập nhật điểm và feedback trong submission
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedBy = teacherId;
    submission.gradedAt = new Date();
    await assignment.save();

    // === Đồng bộ sang collection Grade ===
    // Tìm hoặc tạo bản ghi Grade tương ứng
    const filter = {
      studentId: submission.studentId,
      classId: assignment.classId,
      assignmentId: assignment._id
    };
    const update = {
      assignmentName: assignment.title,
      score: grade,
      maxScore: 100, // có thể lấy từ assignment nếu có trường maxScore, tạm để 100
      weight: 1,
      gradedBy: teacherId,
      gradedAt: new Date()
    };
    // Dùng upsert: true để tạo mới nếu chưa có
    await Grade.findOneAndUpdate(filter, { $set: update }, { upsert: true, new: true });

    res.json({
      message: 'Chấm điểm thành công và đã đồng bộ sang bảng điểm',
      submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Lấy danh sách bài tập của một lớp (cho giáo viên hoặc sinh viên xem)
exports.getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await Assignment.find({ classId })
      .populate('teacherId', 'username')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Lấy chi tiết một bài tập (kèm danh sách bài nộp nếu là giáo viên, hoặc chỉ bài nộp của sinh viên đó)
exports.getAssignmentDetail = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId)
      .populate('teacherId', 'username')
      .populate('classId', 'className classCode');

    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy' });

    const userId = req.user.userId;
    const role = req.user.role;
    const studentId = req.user.studentId;

    // Nếu là giáo viên: trả về full submissions (kèm thông tin sinh viên)
    if (role === 'teacher') {
      // Kiểm tra quyền: giáo viên phải là teacher của lớp
      const classItem = await Class.findById(assignment.classId);
      if (classItem.teacherId.toString() !== userId) {
        return res.status(403).json({ message: 'Không có quyền xem bài nộp của lớp này' });
      }
      // Populate submissions.studentId
      await assignment.populate('submissions.studentId', 'fullName studentCode');
      return res.json(assignment);
    }

    // Nếu là sinh viên: chỉ trả về bài tập và bài nộp của chính họ
    if (role === 'student') {
      const mySubmission = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
      const response = assignment.toObject();
      response.submissions = mySubmission ? [mySubmission] : [];
      return res.json(response);
    }

    // Admin có thể xem tất cả
    if (role === 'admin') {
      await assignment.populate('submissions.studentId', 'fullName studentCode');
      return res.json(assignment);
    }

    res.status(403).json({ message: 'Không có quyền' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Xóa bài tập (giáo viên hoặc admin)
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Bài tập không tồn tại' });

    const userId = req.user.userId;
    const role = req.user.role;

    // Chỉ giáo viên của lớp hoặc admin mới được xóa
    if (role !== 'admin') {
      const classItem = await Class.findById(assignment.classId);
      if (classItem.teacherId.toString() !== userId) {
        return res.status(403).json({ message: 'Không có quyền xóa' });
      }
    }

    // Xóa các file đính kèm (nếu có)
    if (assignment.attachments && assignment.attachments.length) {
      assignment.attachments.forEach(filePath => {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    // Xóa các file bài nộp
    if (assignment.submissions && assignment.submissions.length) {
      assignment.submissions.forEach(sub => {
        if (sub.fileUrl) {
          const fullPath = path.join(__dirname, '..', sub.fileUrl);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      });
    }

    await Assignment.findByIdAndDelete(assignmentId);
    res.json({ message: 'Xóa bài tập thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Lấy danh sách bài tập của sinh viên (theo lớp hoặc tất cả) – có thể bổ sung
exports.getMyAssignments = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) return res.status(400).json({ message: 'Không phải sinh viên' });

    // Tìm các lớp mà sinh viên đang học
    const student = await Student.findById(studentId);
    if (!student || !student.classId) return res.json([]);
    const classId = student.classId;

    const assignments = await Assignment.find({ classId })
      .populate('teacherId', 'username')
      .sort({ dueDate: 1 });

    // Gắn trạng thái nộp bài cho từng assignment
    const result = assignments.map(ass => {
      const submitted = ass.submissions.some(sub => sub.studentId.toString() === studentId);
      return {
        ...ass.toObject(),
        submitted,
        submissionCount: ass.submissions.length
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};