const express = require("express");

const router = express.Router();

const classController = require("../controllers/class.controller");

const {verifyToken} = require("../middlewares/auth")
const { validateClass } = require('../validations/class.validation');
const validate = require('../validations/validate');

router.get("/:id", classController.getClassById);// get class by id
router.get("/", classController.getAllClasses); // get all classes


router.post("/",verifyToken, validateClass,validate, classController.createClass);// create class
router.put("/:id", verifyToken, validateClass,validate, classController.updateClass);// update class
router.delete("/:id", verifyToken, classController.deleteClass);// delete class


router.get('/teacher/me', verifyToken, classController.getClassesByTeacher);



router.get("/students/count/:classId", classController.getStudentCountByClass);// get total students in a class
router.get("/students/:classId", classController.getStudentsByClass);// get students by class

module.exports = router;