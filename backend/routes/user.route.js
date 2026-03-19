const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const validate = require("../validations/validate");

const { registerValidation, loginValidation } = require("../validations/user.validation");

router.post("/register",registerValidation,
    validate,userController.register);

router.post("/login", loginValidation, validate,userController.login);

router.post("/create-teacher", userController.createTeacher);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

router.get("/:id", userController.getUserById);

router.get("/", userController.getAllUsers);



module.exports = router;