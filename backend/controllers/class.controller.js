const Class = require("../schemas/class.schema");
const Student = require("../schemas/student.schema");

// CREATE CLASS
exports.createClass = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const newClass = new Class({
      ...req.body,
      teacherId
    });

    const result = await newClass.save();

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// GET CLASSES BY TEACHER (lấy lớp của giáo viên đang đăng nhập)
exports.getClassesByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const classes = await Class.find({ teacherId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CLASSES
exports.getAllClasses = async (req, res) => {
  try {

    const classes = await Class.find();

    res.json(classes);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// GET CLASS BY ID
exports.getClassById = async (req, res) => {
  try {

    const classData = await Class.findById(req.params.id);

    res.json(classData);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// UPDATE CLASS
exports.updateClass = async (req, res) => {
  try {

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedClass);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// DELETE CLASS
exports.deleteClass = async (req, res) => {
  try {

    await Class.findByIdAndDelete(req.params.id);

    res.json({ message: "Class deleted" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// get students by class
exports.getStudentsByClass = async (req, res) => {
  try {

    const students = await Student.find({ classId: req.params.classId });
    
    res.json(students);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// total students in a class
exports.getStudentCountByClass = async (req, res) => {

  try {

    const totalStudents = await Student.countDocuments({
      classId: req.params.classId
    });

    res.json({
      classId: req.params.classId,
      totalStudents
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};