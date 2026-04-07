const Assignment = require('../schemas/assignment.schema');
const Class = require('../schemas/class.schema');
const Student = require('../schemas/student.schema');
const Grade = require('../schemas/grade.schema');
const fs = require('fs');
const path = require('path');


exports.createAssignment = async (req, res) => {
  try {
    const { title, description, classId, dueDate } = req.body;
    const teacherId = req.user.userId; // từ token

    
    const classItem = await Class.findById(classId);
    if (!classItem) return res.status(404).json({ message: 'Lớp không tồn tại' });
    if (classItem.teacherId && classItem.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Bạn không phải giáo viên của lớp này' });
    }

  
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


exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.studentId; 
    if (!studentId) return res.status(400).json({ message: 'Chỉ sinh viên mới nộp được bài' });

    if (!req.file) return res.status(400).json({ message: 'Chưa có file bài nộp' });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Bài tập không tồn tại' });

   
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Đã quá hạn nộp bài' });
    }

    
    const existing = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã nộp bài cho bài tập này rồi' });
    }

   
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


exports.getSubmittedStudents = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId).populate('submissions.studentId', 'fullName studentCode');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    const submittedStudents = assignment.submissions.map(sub => ({
      studentId: sub.studentId._id,
      studentCode: sub.studentId.studentCode,
      fullName: sub.studentId.fullName,
      submittedAt: sub.submittedAt,
      fileUrl: sub.fileUrl,
      grade: sub.grade,
      feedback: sub.feedback
    }));
    res.json(submittedStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;
    const teacherId = req.user.userId;

    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Bài tập không tồn tại' });

    
    if (assignment.teacherId.toString() !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền chấm bài' });
    }

   
    const submission = assignment.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp' });

  
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedBy = teacherId;
    submission.gradedAt = new Date();
    await assignment.save();

   
 
    const filter = {
      studentId: submission.studentId,
      classId: assignment.classId,
      assignmentId: assignment._id
    };
    const update = {
      assignmentName: assignment.title,
      score: grade,
      maxScore: 100, 
      weight: 1,
      gradedBy: teacherId,
      gradedAt: new Date()
    };
    
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

    
    if (role === 'teacher') {
      
      const classItem = await Class.findById(assignment.classId);
      if (classItem.teacherId.toString() !== userId) {
        return res.status(403).json({ message: 'Không có quyền xem bài nộp của lớp này' });
      }
      
      await assignment.populate('submissions.studentId', 'fullName studentCode');
      return res.json(assignment);
    }

    
    if (role === 'student') {
      const mySubmission = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
      const response = assignment.toObject();
      response.submissions = mySubmission ? [mySubmission] : [];
      return res.json(response);
    }

    
    if (role === 'admin') {
      await assignment.populate('submissions.studentId', 'fullName studentCode');
      return res.json(assignment);
    }

    res.status(403).json({ message: 'Không có quyền' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Bài tập không tồn tại' });

    const userId = req.user.userId;
    const role = req.user.role;

    
    if (role !== 'admin') {
      const classItem = await Class.findById(assignment.classId);
      if (classItem.teacherId.toString() !== userId) {
        return res.status(403).json({ message: 'Không có quyền xóa' });
      }
    }

    
    if (assignment.attachments && assignment.attachments.length) {
      assignment.attachments.forEach(filePath => {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    
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


exports.getMyAssignments = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) return res.status(400).json({ message: 'Không phải sinh viên' });

   
    const student = await Student.findById(studentId);
    if (!student || !student.classId) return res.json([]);
    const classId = student.classId;

    const assignments = await Assignment.find({ classId })
      .populate('teacherId', 'username')
      .sort({ dueDate: 1 });

    
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