const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const { verifyToken } = require("../middlewares/auth");
const { validateStudent } = require("../validations/student.validation");
const validate = require("../validations/validate");

router.get("/search", studentController.searchStudent);

router.get("/", studentController.getAllStudents);

router.get("/:id", studentController.getStudentById);

router.post("/",verifyToken,validateStudent, validate, studentController.createStudent);

router.put("/:id", verifyToken, validateStudent, validate, studentController.updateStudent);

router.delete("/:id", verifyToken, validateStudent, studentController.deleteStudent);

module.exports = router;