const Student = require("../schemas/student.schema");


exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        const result = await student.save();

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate("classId");

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        await student.deleteOne();
        res.json({
            message: "Student deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchStudent = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        const students = await Student.find({
            fullName: { $regex: keyword, $options: "i" }
        });

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

