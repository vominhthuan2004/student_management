const User = require("../schemas/user.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const XLSX = require('xlsx');
const Class = require("../schemas/class.schema");
const Student = require("../schemas/student.schema");


exports.importStudents = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Chưa có file Excel' });

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const results = { success: 0, failed: 0, errors: [] };

        for (const row of rows) {
            try {
               
                const classItem = await Class.findOne({ classCode: row.classCode });
                if (!classItem) {
                    results.failed++;
                    results.errors.push(`Không tìm thấy lớp ${row.classCode}`);
                    continue;
                }

                
                const student = new Student({
                    studentCode: row.studentCode,
                    fullName: row.fullName,
                    email: row.email,
                    phone: row.phone,
                    classId: classItem._id
                });
                await student.save();

               
                let rawPassword = row.password ? String(row.password).replace(/['"\s]/g, '') : '123456';
                const hashedPassword = await bcrypt.hash(rawPassword, 10);

                const user = new User({
                    username: row.username || row.studentCode,
                    password: hashedPassword,
                    role: 'student',
                    studentId: student._id
                });
                await user.save();

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(`Lỗi dòng ${JSON.stringify(row)}: ${err.message}`);
            }
        }

        res.json({ message: 'Import sinh viên hoàn tất', results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.importTeachers = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Chưa có file Excel' });

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const results = { success: 0, failed: 0, errors: [] };

        for (const row of rows) {
            try {
                const hashedPassword = await bcrypt.hash(row.password || '123456', 10);
                const user = new User({
                    username: row.username,
                    password: hashedPassword,
                    role: 'teacher'
                });
                await user.save();
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(`Lỗi dòng ${JSON.stringify(row)}: ${err.message}`);
            }
        }

        res.json({ message: 'Import giáo viên hoàn tất', results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {

        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.json(users);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.register = async (req, res) => {
  try {
    const { username, password, role, studentId } = req.body;

    if (role && role !== 'student') {
      return res.status(403).json({ message: 'Không thể tự tạo tài khoản teacher/admin' });
    }

   
    if (studentId) {
      const existingUser = await User.findOne({ studentId });
      if (existingUser) {
        return res.status(400).json({ message: 'Sinh viên này đã có tài khoản' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: 'student', studentId });
    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
                studentId: user.studentId ? user.studentId.toString() : null
            },
            "SECRET_KEY",
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                role: user.role,
                studentId: user.studentId ? user.studentId.toString() : null
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateUser = async (req, res) => {

    try {

        const { username, password, role } = req.body;

        let updateData = { username, role };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select("-password");

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


exports.deleteUser = async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};



exports.createTeacher = async (req, res) => {

    try {

        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = new User({
            username,
            password: hashedPassword,
            role: "teacher"
        });

        const result = await teacher.save();

        res.status(201).json({
            message: "Teacher created successfully",
            user: result
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

