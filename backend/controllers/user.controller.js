const User = require("../schemas/user.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//get user by id
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

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.json(users);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REGISTER
exports.register = async (req, res) => {
    try {

        const { username, password, role, studentId } = req.body;

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword,
            role,
            studentId
        });

        const result = await user.save();

        res.status(201).json({
            message: "User created successfully",
            user: result
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIN
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

        // Chuyển ObjectId thành string
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
// UPDATE USER

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

// DELETE USER
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

// admin create teacher

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

