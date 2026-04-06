const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const validate = require("../validations/validate");

const { registerValidation, loginValidation } = require("../validations/user.validation");

const { verifyToken, isAdmin } = require('../middlewares/auth');

const upload = require('../utils/upload');

router.post('/import-students', verifyToken, isAdmin, upload.single('file'), userController.importStudents);

router.post('/import-teachers', verifyToken, isAdmin, upload.single('file'), userController.importTeachers);

router.post("/register",verifyToken, isAdmin, registerValidation,validate, userController.register);

router.post("/login", loginValidation, validate, userController.login);

router.post("/create-teacher", verifyToken, isAdmin, userController.createTeacher);

router.put("/:id", verifyToken, isAdmin, userController.updateUser);

router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

router.get("/:id", userController.getUserById);

router.get("/", userController.getAllUsers);



module.exports = router;